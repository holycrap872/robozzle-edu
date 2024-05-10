import { encodeBits, decodeBits } from '../src/lib/encoder'


test('Test encoding of new state', () => {
  const stateToEncode = { output: "", val: 5, bits: 4 }
  encodeBits(stateToEncode, 4, 11);
  expect(stateToEncode.output).toBe("fb");
  expect(stateToEncode.val).toBe(0);
  expect(stateToEncode.bits).toBe(3);
});


test('Test encoding of existing state', () => {
  const stateToEncode = { output: "hello", val: 5, bits: 4 }
  encodeBits(stateToEncode, 4, 11);
  expect(stateToEncode.output).toBe("hellofb");
  expect(stateToEncode.val).toBe(0);
  expect(stateToEncode.bits).toBe(3);
});


test('Test decoding of simple state', () => {
  const stateToDecode = { input: "fbbb", index: 0, val: 5, bits: 2 }
  const ret = decodeBits(stateToDecode, 4);
  expect(ret).toBe(4)
  expect(stateToDecode.input).toBe("fbbb");
  expect(stateToDecode.index).toBe(1);
  expect(stateToDecode.val).toBe(5);
  expect(stateToDecode.bits).toBe(4);
});
