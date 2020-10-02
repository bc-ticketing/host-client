<template>
  <div class="modification-container">
    <EventModificationCard></EventModificationCard>
    <TicketModificationCard></TicketModificationCard>
  </div>
</template>

<script>
import { EventModificationCard } from "../components/EventModificationCard";
import { TicketModificationCard } from "../components/TicketModificationCard";

export default {
  name: "Modification",
  components: { EventModificationCard, TicketModificationCard },
  data: () => ({})
};
</script>

<style>
</style>