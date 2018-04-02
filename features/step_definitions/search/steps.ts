import chai = require("chai");
import { expect } from "chai";
import chaiHttp = require("chai-http");
chai.use(chaiHttp);

import {
  CallbackStepDefinition,
  Given,
  TableDefinition,
  Then,
  When,
  World
} from "cucumber";

import { Website } from "../../../src/models/website";

import "./hooks";
import "./world";

Given("these websites on the web", function(
  table: TableDefinition,
  done: CallbackStepDefinition
) {
  Promise.all(
    Array.from(this.convert(table), website => this.add(website))
  ).then(() => done());
});

When("I search for {string} on Google", function(
  searchValue: string,
  done: CallbackStepDefinition
) {
  const app = this.server.get().build();
  chai
    .request(app)
    .get(`/website?search=${searchValue}`)
    .end((err, res) => {
      this.actual = {
        statusCode: res.status,
        websites: res.body as Website[]
      };
      done();
    });
});

Then("results are", function(
  table: TableDefinition,
  done: CallbackStepDefinition
) {
  const expectedWebsites = this.convert(table);

  expect(this.actual).to.be.deep.equal({
    statusCode: 200,
    websites: expectedWebsites
  });

  done();
});

Then("i have an error", function(done: CallbackStepDefinition) {
  const expectedStatusCode = 400;
  expect(this.actual.statusCode).to.be.equal(expectedStatusCode);
  done();
});
