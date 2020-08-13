<template>
  <div class="home">
    <!-- <div class="container-fluid paralleax" ref="parallax"></div> -->
    <div class="container"></div>
    <NewEventForm />
    <md-button
      id="link-tickets"
      class="md-primary"
      @click="()=>$router.push('ticket')"
    >Create ticket categories</md-button>
  </div>
</template>

<script>
import NewEventForm from "@/components/NewEventForm.vue";

export default {
  name: "NewEvent",
  components: {
    NewEventForm
  }
};
</script>

<style>
#link-tickets {
  float: right;
}
</style>