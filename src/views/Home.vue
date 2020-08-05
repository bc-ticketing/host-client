<template>
  <div class="home">
    <!-- <div class="container-fluid paralleax" ref="parallax"></div> -->
    <div class="container"></div>
    <CreateEventForm />
    <md-button
      id="link-tickets"
      class="md-primary"
      @click="()=>$router.push('ticket')"
    >Create ticket categories</md-button>
  </div>
</template>

<script>
import CreateEventForm from "@/components/CreateEventForm.vue";

export default {
  name: "Home",
  components: {
    CreateEventForm
  }
};
</script>

<style>
#link-tickets {
  float: right;
}
</style>