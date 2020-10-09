<template>
  <div class="blockchain-stats-card-container">
    <h2>BlockchainStatsCard container</h2>
  </div>
</template>

<script>
// Todo:
// - Create variables to Event object, that are used here.
// - Further, add functions to event.js to fetch those stats,
//    so that we can easily integrate this feature also in the guest client.

export default {
  name: "BlockchainStatsCard",
  props: {
    event: Object
  },
  data: () => ({})
};
</script>

<style>
</style>
