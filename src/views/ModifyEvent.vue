<template>
  <div class="modify-event-container">
    <CreateTicketTypeForm />
  </div>
</template>

<script>
// @ is an alias to /src
import CreateTicketTypeForm from "@/components/CreateTicketTypeForm";

export default {
  name: "Home",
  components: {
    CreateTicketTypeForm
  }
};
</script>
