<!-- This view contains a form to verify an identity with the active account. -->
<template>
  <div class="approve-container">
    <IdentityApprovalForm />
  </div>
</template>

<script>
import IdentityApprovalForm from "../components/IdentityApprovalForm";

export default {
  name: "ApproveIdentity",
  components: {
    IdentityApprovalForm
  }
};
</script>

<style>
</style>
