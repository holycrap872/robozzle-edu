import { RobotDirection, RobotStates } from "./baseTypes";

export interface RobotAnimation {
  left: number,
  top: number,
  deg: number,
  scale: number,
  stack: number,
  stackCount: number,
}


export class Robot {
  robotDir: RobotDirection;
  robotDeg: number;
  robotCol: number;
  robotRow: number;
  robotAnimation: RobotAnimation | null;
  robotState: RobotStates;
  robotDelay: number;
  robotSpeed: number;

  constructor() {
    this.robotDir = RobotDirection.Right;
    this.robotDeg = 0;
    this.robotCol = 0;
    this.robotRow = 0;
    this.robotAnimation = null;
    this.robotState = RobotStates.Reset;
    this.robotDelay = 0;
    this.robotSpeed = 5;
  }
}