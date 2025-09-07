<template>
  <div class="container d-flex justify-content-center align-items-center" style="min-height: 100vh;">
    <div class="card p-4" style="max-width: 400px; width: 100%;">
      <h3 class="text-center mb-3">Login</h3>
      <form @submit.prevent="login">
        <div class="mb-3">
          <label>Email</label>
          <input v-model="email" type="email" class="form-control" />
        </div>
        <div class="mb-3">
          <label>Password</label>
          <input v-model="password" type="password" class="form-control" />
        </div>
        <button type="submit" class="btn btn-dark w-100">Login</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();
const email = ref("");
const password = ref("");

const login = async () => {
  try {
    const response = await axios.post(`http://localhost:3000/api/login`, {
      email: email.value.trim(),
      password: password.value.trim(),
    });

    if (response.data.success) {
      alert("Login Success");

      // save userId email in localStorage 
      localStorage.setItem("userId", response.data.user.id);
      router.push("/deposit");
      localStorage.setItem("userEmail", response.data.user.email);
    } else {
      alert("Invalid email or password");
    }
  } catch (err) {
    console.error(err);
    alert("Server error");
  }
};
</script>
