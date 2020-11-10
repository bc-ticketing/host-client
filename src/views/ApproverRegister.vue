<!-- This view contains a form to register as an approver. -->
<template>
  <div class="approver-container">
    <ApproverRegisterForm />
  </div>
</template>

<script>
import ApproverRegisterForm from "../components/ApproverRegisterForm";

export default {
  name: "ApproverRegister",
  components: {
    ApproverRegisterForm
  }
};
</script>

<style>
</style>