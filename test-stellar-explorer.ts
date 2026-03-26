/**
 * Test file for Stellar Explorer Integration
 * This file demonstrates and tests the stellar-explorer utilities
 */

import {
  getTransactionUrl,
  getAccountUrl,
  getContractUrl,
  getStellarNetwork,
  getAvailableExplorers,
  isValidStellarAddress,
  isValidStellarTxHash,
  isValidStellarContractId,
  type StellarNetwork,
} from '../lib/utils/stellar-explorer';

// Test data
const testTxHash = 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567890';
const testAddress = 'GD1234567890ABCDEF1234567890ABCDEF12345678';
const testContractId = 'C1234567890ABCDEF1234567890ABCDEF12345678';

console.log('🚀 Testing Stellar Explorer Integration\n');

// Test 1: Available explorers
console.log('1. Available Explorers:');
const explorers = getAvailableExplorers();
console.log('   ', explorers);

// Test 2: Network detection
console.log('\n2. Network Detection:');
console.log('   Test address network:', getStellarNetwork(testAddress));
console.log('   Test tx hash network:', getStellarNetwork(testTxHash));

// Test 3: URL generation
console.log('\n3. URL Generation:');
console.log('   Transaction URL:', getTransactionUrl(testTxHash));
console.log('   Account URL:', getAccountUrl(testAddress));
console.log('   Contract URL:', getContractUrl(testContractId));

// Test 4: Different networks
console.log('\n4. Network-specific URLs:');
console.log('   Testnet Transaction URL:', getTransactionUrl(testTxHash, 'testnet'));
console.log('   Mainnet Account URL:', getAccountUrl(testAddress, 'mainnet'));

// Test 5: Different explorers
console.log('\n5. Different Explorers:');
console.log('   Stellar Expert Transaction:', getTransactionUrl(testTxHash, 'mainnet', 'stellar.expert'));
console.log('   Stellar Chain Account:', getAccountUrl(testAddress, 'mainnet', 'stellarchain.io'));

// Test 6: Validation
console.log('\n6. Validation Tests:');
console.log('   Valid address:', isValidStellarAddress(testAddress));
console.log('   Invalid address:', isValidStellarAddress('invalid'));
console.log('   Valid tx hash:', isValidStellarTxHash(testTxHash));
console.log('   Invalid tx hash:', isValidStellarTxHash('invalid'));
console.log('   Valid contract ID:', isValidStellarContractId(testContractId));
console.log('   Invalid contract ID:', isValidStellarContractId('invalid'));

// Test 7: Error handling
console.log('\n7. Error Handling:');
try {
  getTransactionUrl('');
} catch (error) {
  console.log('   Empty tx hash error:', error.message);
}

try {
  getAccountUrl('');
} catch (error) {
  console.log('   Empty address error:', error.message);
}

console.log('\n✅ All tests completed!');

// Export for potential use in components
export {
  testTxHash,
  testAddress,
  testContractId,
};
