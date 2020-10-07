<template>
  <div class="home">
    <!-- <div class="container-fluid paralleax" ref="parallax"></div> -->
    <div class="container"></div>
    <EventForm />
    <md-button
      id="link-tickets"
      class="md-primary"
      @click="() => $router.push('ticket')"
      >Create ticket categories</md-button
    >
  </div>
</template>

<script>
import EventForm from "@/components/EventForm.vue";

export default {
  name: "NewEvent",
  components: {
    EventForm
  }
};
</script>

<style>
#link-tickets {
  float: right;
}
</style>