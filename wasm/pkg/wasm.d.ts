/* tslint:disable */
/* eslint-disable */
/**
*/
export class BTRS {
  free(): void;
/**
* @param {number} tiefenlimit
* @param {number} compl
* @returns {BTRS}
*/
  static new(tiefenlimit: number, compl: number): BTRS;
/**
* @param {string} poscode
* @param {string} p
* @returns {string}
*/
  answer(poscode: string, p: string): string;
/**
* @param {string} poscode
* @param {string} p
* @returns {number}
*/
  calc(poscode: string, p: string): number;
/**
*/
  d: number;
}
/**
*/
export class TogreCalculator {
  free(): void;
/**
* @returns {TogreCalculator}
*/
  static new(): TogreCalculator;
/**
* @param {string} poscode
* @param {string} p
* @returns {number}
*/
  calc(poscode: string, p: string): number;
}
