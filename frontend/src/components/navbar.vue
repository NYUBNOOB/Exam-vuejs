<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container-fluid">
      <router-link class="navbar-brand" style="color: black; font-weight: bold;" to="/deposit">
        Clicknext
      </router-link>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown"
        aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNavDropdown">
        <ul class="navbar-nav  mx-auto mb-2 mb-lg-0 d-flex gap-3">
          <li class="nav-item">
            <router-link class="nav-link" to="/deposit">Deposit/Withdraw</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/transaction">Transaction</router-link>
          </li>
        </ul>
        <button type="button" class="btn btn-dark" @click.prevent="logout">
          Logout
        </button>
      </div>
    </div>
  </nav>

</template>

<script setup>
import { useRouter } from "vue-router";
const router = useRouter();

const logout = () => {
  router.push("/"); // goback login
};
</script>
