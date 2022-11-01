/* tslint:disable */
/* eslint-disable */
/**
*/
export class BTRSInterface {
  free(): void;
/**
* @returns {BTRSInterface}
*/
  static new(): BTRSInterface;
/**
* @param {string} poscode
* @param {string} p
* @param {number} tiefe
* @param {number} compl
* @returns {string}
*/
  answer(poscode: string, p: string, tiefe: number, compl: number): string;
/**
* @param {string} poscode
* @param {string} p
* @param {number} tiefe
* @param {number} compl
* @returns {number}
*/
  calc(poscode: string, p: string, tiefe: number, compl: number): number;
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
/**
* @returns {number}
*/
  len(): number;
}
