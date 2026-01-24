#!/bin/bash

# test-contracts.sh
# Run tests for all Soroban smart contracts in xConfess

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

# Parse command line arguments
VERBOSE=false
NOCAPTURE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        --nocapture)
            NOCAPTURE=true
            shift
            ;;
        -h|--help)
            echo "Usage: ./scripts/test-contracts.sh [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  -v, --verbose    Show verbose test output"
            echo "  --nocapture      Show println! output from tests"
            echo "  -h, --help       Show this help message"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use -h or --help for usage information"
            exit 1
            ;;
    esac
done

# Check if running from project root
if [ ! -d "contracts/soroban-xconfess" ]; then
    print_error "Error: Must run from project root directory"
    echo "Current directory: $(pwd)"
    echo "Please cd to the xConfess root directory"
    exit 1
fi

# Check if cargo is installed
if ! command -v cargo &> /dev/null; then
    print_error "Cargo is not installed!"
    echo "Install Rust and Cargo: https://rustup.rs/"
    exit 1
fi

print_header "Testing xConfess Soroban Contracts"

# Array of contracts to test
CONTRACTS=(
    "confession-anchor"
    # Add more contracts here as they're developed
    # "reputation-badges"
    # "anonymous-tipping"
)

# Track test results
SUCCESSFUL_TESTS=0
FAILED_TESTS=0
FAILED_CONTRACTS=()

# Build test command arguments
TEST_ARGS=""
if [ "$VERBOSE" = true ]; then
    TEST_ARGS="$TEST_ARGS --verbose"
fi
if [ "$NOCAPTURE" = true ]; then
    TEST_ARGS="$TEST_ARGS -- --nocapture"
fi

# Test each contract
for contract in "${CONTRACTS[@]}"; do
    CONTRACT_DIR="contracts/soroban-xconfess/$contract"
    
    if [ ! -d "$CONTRACT_DIR" ]; then
        print_warning "Contract directory not found: $CONTRACT_DIR (skipping)"
        continue
    fi
    
    echo ""
    print_info "Testing $contract..."
    echo ""
    
    cd "$CONTRACT_DIR"
    
    # Run tests
    if cargo test $TEST_ARGS; then
        print_success "Tests passed for $contract"
        ((SUCCESSFUL_TESTS++))
    else
        print_error "Tests failed for $contract"
        FAILED_CONTRACTS+=("$contract")
        ((FAILED_TESTS++))
    fi
    
    # Return to project root
    cd - > /dev/null
done

echo ""
print_header "Test Summary"

echo "Total contracts tested: ${#CONTRACTS[@]}"
print_success "Successful tests: $SUCCESSFUL_TESTS"

if [ $FAILED_TESTS -gt 0 ]; then
    print_error "Failed tests: $FAILED_TESTS"
    echo "Failed contracts:"
    for contract in "${FAILED_CONTRACTS[@]}"; do
        echo "  - $contract"
    done
    echo ""
    print_info "Run with --verbose flag for detailed error output:"
    echo "  ./scripts/test-contracts.sh --verbose"
    exit 1
fi

echo ""
print_success "All contract tests passed! ✓"

echo ""
print_info "Next steps:"
echo "  1. Build contracts: ./scripts/build-contracts.sh"
echo "  2. Deploy to testnet: ./scripts/deploy-contracts.sh"
echo "  3. See docs/SOROBAN_SETUP.md for more information"

exit 0