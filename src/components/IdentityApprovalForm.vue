<template>
  <div class="approve-identity-form">
    <form novalidate class="md-layout">
      <md-card class="md-layout-item">
        <md-card-header>
          <div class="md-title">Identity Approval</div>
        </md-card-header>

        <md-card-content>
          <div class="md-layout md-gutter">
            <div class="md-layout-item md-small-size-100">
              <md-field>
                <label for="address">Address to approve</label>
                <md-input name="address" id="address" v-model="form.address" />
              </md-field>
            </div>
          </div>

          <div class="md-layout-item md-small-size-100">
            <md-field>
              <label for="approval-level">Approval Level</label>
              <md-select
                type="number"
                name="approval-level"
                id="approval-level"
                v-model="form.approvalLevel"
              >
                <md-option value="1">1</md-option>
                <md-option value="2">2</md-option>
                <md-option value="3">3</md-option>
              </md-select>
            </md-field>
          </div>
        </md-card-content>

        <md-card-actions>
          <md-button type="submit" class="md-primary" @click="approveIdentity">Approve Identity</md-button>
        </md-card-actions>

        <!-- <md-card-actions>
          <md-button type="submit" class="md-primary" @click="getSecurityLevel">Fetch level</md-button>
        </md-card-actions>-->
      </md-card>
    </form>
  </div>
</template>

<script>
export default {
  name: "IdentityApprovalForm",
  data() {
    return {
      form: {
        address: "0x83c2738dafac18e64e5ddc6008fe323ac5c489a5",
        approvalLevel: 1
      }
    };
  },
  computed: {
    web3() {
      return this.$store.state.web3;
    },
    identityContract() {
      return this.$store.state.identity;
    }
  },
  methods: {
    async approveIdentity() {
      const approval = await this.identityContract.methods
        .approveIdentity(this.form.address, this.form.approvalLevel)
        .send({ from: this.$store.state.web3.account });
      console.log(approval);
    },
    async getSecurityLevel() {
      const secLevel = await this.identityContract.methods
        .getSecurityLevel(this.$store.state.web3.account, this.form.address)
        .call();
      console.log(secLevel);
    }
  }
};
</script>

<style>
</style>
