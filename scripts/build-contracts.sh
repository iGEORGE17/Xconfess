#!/bin/bash

# build-contracts.sh
# Build all Soroban smart contracts for xConfess

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# Check if running from project root
if [ ! -d "contracts/soroban-xconfess" ]; then
    print_error "Error: Must run from project root directory"
    echo "Current directory: $(pwd)"
    echo "Please cd to the xConfess root directory"
    exit 1
fi

# Check if stellar CLI is installed
if ! command -v stellar &> /dev/null; then
    print_error "Stellar CLI is not installed!"
    echo ""
    echo "Install with: cargo install --locked stellar-cli --features opt"
    echo "Or see: https://soroban.stellar.org/docs/getting-started/setup"
    exit 1
fi

# Check if wasm32 target is installed
if ! rustup target list | grep -q "wasm32-unknown-unknown (installed)"; then
    print_warning "wasm32-unknown-unknown target not installed"
    print_info "Installing wasm32-unknown-unknown target..."
    rustup target add wasm32-unknown-unknown
    print_success "Target installed successfully"
fi

print_header "Building xConfess Soroban Contracts"

# Array of contracts to build
CONTRACTS=(
    "confession-anchor"
    # Add more contracts here as they're developed
    # "reputation-badges"
    # "anonymous-tipping"
)

# Track build results
SUCCESSFUL_BUILDS=0
FAILED_BUILDS=0
FAILED_CONTRACTS=()

# Build each contract
for contract in "${CONTRACTS[@]}"; do
    CONTRACT_DIR="contracts/soroban-xconfess/$contract"
    
    if [ ! -d "$CONTRACT_DIR" ]; then
        print_warning "Contract directory not found: $CONTRACT_DIR (skipping)"
        continue
    fi
    
    echo ""
    print_info "Building $contract..."
    
    cd "$CONTRACT_DIR"
    
    # Build using stellar CLI
    if stellar contract build; then
        print_success "Built $contract successfully"
        
        # Display WASM file info
        WASM_FILE="target/wasm32-unknown-unknown/release/${contract//-/_}.wasm"
        if [ -f "$WASM_FILE" ]; then
            WASM_SIZE=$(ls -lh "$WASM_FILE" | awk '{print $5}')
            print_info "WASM file: $WASM_FILE ($WASM_SIZE)"
        fi
        
        ((SUCCESSFUL_BUILDS++))
    else
        print_error "Failed to build $contract"
        FAILED_CONTRACTS+=("$contract")
        ((FAILED_BUILDS++))
    fi
    
    # Return to project root
    cd - > /dev/null
done

echo ""
print_header "Build Summary"

echo "Total contracts: ${#CONTRACTS[@]}"
print_success "Successful builds: $SUCCESSFUL_BUILDS"

if [ $FAILED_BUILDS -gt 0 ]; then
    print_error "Failed builds: $FAILED_BUILDS"
    echo "Failed contracts:"
    for contract in "${FAILED_CONTRACTS[@]}"; do
        echo "  - $contract"
    done
    exit 1
fi

echo ""
print_success "All contracts built successfully! 🎉"

# Optional: Display WASM file locations
echo ""
print_info "WASM files are located at:"
for contract in "${CONTRACTS[@]}"; do
    WASM_FILE="contracts/soroban-xconfess/$contract/target/wasm32-unknown-unknown/release/${contract//-/_}.wasm"
    if [ -f "$WASM_FILE" ]; then
        echo "  - $WASM_FILE"
    fi
done

echo ""
print_info "Next steps:"
echo "  1. Run tests: ./scripts/test-contracts.sh"
echo "  2. Deploy to testnet: ./scripts/deploy-contracts.sh"
echo "  3. See docs/SOROBAN_SETUP.md for more information"

exit 0