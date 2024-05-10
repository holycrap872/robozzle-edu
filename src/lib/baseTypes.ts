export enum RobotStates {
  Reset = 0,
  Stopped = 1,
  Started = 2,
  Stepping = 3,
  Finished = 4
}


export enum RobotDirection {
  Right = 0,
  Down = 1,
  Left = 2,
  Up = 3,
}

export interface RobotPosition {
  row: number,
  col: number,
  direction: RobotDirection,
}

export interface StackElement {
  sub: number,
  cmd: number,
}


export interface StackBreakpoint {
  index: number,
}


export interface BoardBreakpoint {
  row: number,
  col: number,
}