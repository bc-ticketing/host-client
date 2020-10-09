<template>
  <div class="ticket-aftermarket-container">
    <h4>TicketAftermarket container</h4>
    <p>
      Title of ticket for this TicketAftermarket component : {{ ticket.title }}
    </p>
  </div>
</template>

<script>
export default {
  name: "TicketAftermarket",
  props: {
    ticket: Object
  },
  data: () => ({}),
  methods: {}
};
</script>

<style>
</style>
