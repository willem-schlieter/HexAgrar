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
export class TOGREInterface {
  free(): void;
/**
* @param {string} db_code
* @param {number} symmeth
* @param {boolean} reviter
* @param {boolean} prefmat
* @returns {TOGREInterface}
*/
  static new(db_code: string, symmeth: number, reviter: boolean, prefmat: boolean): TOGREInterface;
/**
* @param {string} poscode
* @param {string} p
* @returns {number}
*/
  calc(poscode: string, p: string): number;
/**
* @param {string} poscode
* @param {string} p
* @returns {number}
*/
  get(poscode: string, p: string): number;
/**
* @returns {number}
*/
  len(): number;
}
