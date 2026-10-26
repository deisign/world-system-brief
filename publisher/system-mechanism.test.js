import test from "node:test";
import assert from "node:assert/strict";
import {systemMechanismPage,HORMUZ} from "./system-mechanism.js";
test("Mechanism generates bilingual, sourced schematic without invented capacity",()=>{for(const lang of ["en","ua"]){const s=systemMechanismPage({lang});assert.match(s,/<svg/);assert.match(s,/iea.org/);assert.match(s,/East–West|EAST–WEST/);assert.match(s,/FUJAIRAH|ФУДЖЕЙРА/);assert.match(s,/NOT TO SCALE/);assert.match(s,new RegExp('lang="'+lang+'"'));}});
test("Mechanism rejects missing provenance and incomplete paths",()=>{assert.throws(()=>systemMechanismPage({model:{...HORMUZ,source:""}}));assert.throws(()=>systemMechanismPage({model:{...HORMUZ,routes:["hormuz"]}}));});
