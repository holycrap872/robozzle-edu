// tests/calculator.test.ts

import { Robot } from '../src/lib/robot';  // Adjust path as necessary

test('Test initializtaion of Robot', () => {
  const robot = new Robot();
  expect(robot.robotRow).toBe(0);
  expect(robot.robotCol).toBe(0);
});