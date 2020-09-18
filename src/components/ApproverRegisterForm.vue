<template>
  <div class="approver-register-form-container">
    <form novalidate class="md-layout" @submit.prevent="isApproverRegisterFormComplete">
      <md-card class="md-layout-item">
        <md-card-header>
          <div class="md-title">Approver Registration</div>
        </md-card-header>

        <md-card-content>
          <div class="md-layout md-gutter">
            <div class="md-layout-item md-small-size-100">
              <md-field>
                <label for="event-title">Approver Title</label>
                <md-input name="approver-title" id="approver-title" v-model="form.approverTitle" />
              </md-field>
            </div>
          </div>

          <div class="md-layout md-gutter">
            <div class="md-layout-item md-small-size-100 info-dialog">
              <md-field>
                <label for="nr-of-levels">Number of Levels</label>
                <md-select
                  type="number"
                  id="numberOfLevels"
                  name="numberOfLevels"
                  v-model="form.numberOfLevels"
                >
                  <md-option value="1">1</md-option>
                  <md-option value="2">2</md-option>
                  <md-option value="3">3</md-option>
                  <md-option value="4">4</md-option>
                  <md-option value="5">5</md-option>
                </md-select>
              </md-field>
              <div class="info-dialog-button">
                <md-button
                  class="md-icon-button md-primary"
                  @click="showNumberOfLevelsDialog = true"
                >
                  <md-icon>help_outline</md-icon>
                </md-button>
              </div>
            </div>
          </div>

          <md-dialog :md-active.sync="showNumberOfLevelsDialog">
            <md-dialog-title>Security Levels</md-dialog-title>
            <p class="dialog-text">
              Choose the number of levels that you want to provide for identity verification.
              The higher the level the more secure should the verification process be.
              Consider, that for an event that requires e.g. your level 2 verification, anyone
              with a level 2 or higher verification from you can buy a ticket for this event.
              So a higher level always comes with permission for your lower specified levels.
            </p>
            <p></p>
            <md-button class="md-primary" @click="showNumberOfLevelsDialog = false">Close</md-button>
          </md-dialog>

          <div class="md-layout-item md-small-size-100">
            <md-field>
              <label for="firstLevel">First Level - Lowest Level</label>
              <md-input name="firstLevel" id="firstLevel" v-model="form.firstLevel" />
            </md-field>
          </div>

          <div v-if="form.numberOfLevels >= 2" class="md-layout-item md-small-size-100">
            <md-field>
              <label for="secondLevel">Second Level</label>
              <md-input name="secondLevel" id="secondLevel" v-model="form.secondLevel" />
            </md-field>
          </div>

          <div v-if="form.numberOfLevels >= 3" class="md-layout-item md-small-size-100">
            <md-field>
              <label for="thirdLevel">Third Level</label>
              <md-input name="thirdLevel" id="thirdLevel" v-model="form.thirdLevel" />
            </md-field>
          </div>

          <div v-if="form.numberOfLevels >= 4" class="md-layout-item md-small-size-100">
            <md-field>
              <label for="fourthLevel">Fourth Level</label>
              <md-input name="fourthLevel" id="fourthLevel" v-model="form.fourthLevel" />
            </md-field>
          </div>

          <div v-if="form.numberOfLevels >= 5" class="md-layout-item md-small-size-100">
            <md-field>
              <label for="fifthLevel">Fifth Level</label>
              <md-input name="fifthLevel" id="fifthLevel" v-model="form.fifthLevel" />
            </md-field>
          </div>

          <div class="md-layout-item md-small-size-100">
            <md-field>
              <label for="approver-url">URL</label>
              <md-input name="approver-url" id="approver-url" v-model="form.approverURL" />
            </md-field>
          </div>

          <div class="md-layout-item md-small-size-100">
            <md-field>
              <label for="twitter">Twitter</label>
              <md-input name="twitter" id="twitter" v-model="form.approverTwitter" />
            </md-field>
          </div>
        </md-card-content>

        <!-- <md-card-actions>
          <md-button type="submit" class="md-primary" @click="createIpfsString">create ipfs string</md-button>
        </md-card-actions>-->

        <md-card-actions>
          <md-button
            type="submit"
            class="md-primary"
            @click="registerAsApprover"
          >Register as approver</md-button>
        </md-card-actions>
      </md-card>
    </form>
  </div>
</template>

<script>
import { validationMixin } from "vuelidate";
import {
  required,
  email,
  minLength,
  maxLength
} from "vuelidate/lib/validators";

// project internal imports
import { NETWORKS } from "../constants/constants.js";
import { cidToArgs, argsToCid } from "idetix-utils";

export default {
  name: "ApproverRegisterForm",
  data() {
    return {
      showNumberOfLevelsDialog: false,
      ipfsHash: "QmYWGJaqiYUPu5JnuUhVVbyXB6g6ydxcie3iwrbC7vxnNP",
      ipfsArgs: null,
      ipfsData: null,
      ipfsString: null,
      form: {
        // ipfs info
        approverTitle: "Idetix",
        methods: [],
        firstLevel: "email",
        secondLevel: "mobile phone",
        thirdLevel: "kyc",
        fourthLevel: "",
        fifthLevel: "",
        approverURL: "http://www.idetix.ch",
        approverTwitter: "",
        // blockchain info
        numberOfLevels: 1
      },
      sending: false,
      showNrLevels: false
    };
  },
  computed: {
    web3() {
      return this.$store.state.web3;
    },
    identityContract() {
      return this.$store.state.identity;
    },
    ipfsInstance() {
      return this.$store.state.ipfsInstance;
    },
    approverMethods() {
      let methodArray = [];
      if (this.form.firstLevel != "") {
        methodArray.push({
          level: 1,
          value: this.form.firstLevel
        });
      }
      if (this.form.secondLevel != "") {
        methodArray.push({
          level: 2,
          value: this.form.secondLevel
        });
      }
      if (this.form.thirdLevel != "") {
        methodArray.push({
          level: 3,
          value: this.form.thirdLevel
        });
      }
      if (this.form.fourthLevel != "") {
        methodArray.push({
          level: 4,
          value: this.form.fourthLevel
        });
      }
      if (this.form.fifthLevel != "") {
        methodArray.push({
          level: 5,
          value: this.form.fifthLevel
        });
      }
      return methodArray;
    }
  },
  methods: {
    createIpfsString() {
      var methods = this.approverMethods.slice(0, this.form.numberOfLevels);
      let json = JSON.stringify({
        version: "1.0",
        approver: {
          title: this.form.approverTitle,
          methods: methods,
          url: this.form.approverURL,
          twitter: this.form.approverTwitter
        }
      });
      console.log(json);
      return json;
    },
    async uploadToIpfs() {
      this.ipfsString = this.createIpfsString();
      this.sending = true;
      const response = await this.ipfsInstance.add(this.ipfsString);
      this.ipfsHash = response.path;
      console.log("http://ipfs.io/ipfs/" + this.ipfsHash);

      // Instead of this timeout, here you can call your API
      window.setTimeout(() => {
        this.ipfsArgs = cidToArgs(this.ipfsHash);
        this.sending;
      }, 1500);
    },
    async downloadFromIpfs() {
      console.log("downloading from ipfs...");
      for await (const chunk of this.ipfs.cat(this.ipfsHash)) {
        this.ipfsData = Buffer(chunk, "utf8").toString();
      }
    },
    addApproverMethod(lvl, val) {
      this.approverMethods.push({
        level: lvl,
        value: val
      });
    },
    isApproverRegisterFormComplete() {
      return true;
    },
    async registerAsApprover() {
      await this.uploadToIpfs();
      if (this.ipfsArgs === null) {
        this.ipfsArgs = cidToArgs(this.ipfsHash);
      }
      let register = await this.identityContract.methods
        .registerApprover(
          this.ipfsArgs.hashFunction,
          this.ipfsArgs.size,
          this.ipfsArgs.digest
        )
        .send({ from: this.web3.account });

      console.log(register);
    }
  }
};
</script>

<style>
</style>