<template>
  <navbar />
  <div class="container d-flex justify-content-center align-items-center" style="min-height: 50vh;">
    <div class="card text-center w-100" style="max-width: 500px;">
      <div class="card-body">
        <h5 class="card-title mb-3">
          จำนวนเงินคงเหลือ: {{ balance !== null ? balance : 'กำลังโหลด...' }}
        </h5>

        <label class="form-label">จำนวนเงิน *</label>
        <input type="number" class="form-control mb-3" placeholder="กรอกจำนวนเงิน" v-model.number="amount">

        <div class="row g-2">
          <div class="col-6">
            <button type="button" class="btn btn-success w-100" @click="showDepositModal">
              ฝาก
            </button>
          </div>
          <div class="col-6">
            <button type="button" class="btn btn-danger w-100" @click="showWithdrawModal">
              ถอน
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Deposit Modal -->
  <div class="modal fade" id="depositModal" ref="depositModalRef" tabindex="-1" aria-labelledby="depositModalLabel"
    aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="depositModalLabel">ยืนยันการฝากเงิน</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          คุณต้องการฝากเงินจำนวน <strong>{{ amount }}</strong> บาท ใช่หรือไม่?
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-dark" data-bs-dismiss="modal">ยกเลิก</button>
          <button type="button" class="btn btn-dark" @click="confirmDeposit">ยืนยัน</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Withdraw Modal -->
  <div class="modal fade" id="withdrawModal" ref="withdrawModalRef" tabindex="-1" aria-labelledby="withdrawModalLabel"
    aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="withdrawModalLabel">ยืนยันการถอนเงิน</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          คุณต้องการถอนเงินจำนวน <strong>{{ amount }}</strong> บาท ใช่หรือไม่?
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-dark" data-bs-dismiss="modal">ยกเลิก</button>
          <button type="button" class="btn btn-dark" @click="confirmWithdraw">ยืนยัน</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>

import navbar from './navbar.vue';
import { ref, onMounted } from "vue";
import axios from "axios";
import * as bootstrap from "bootstrap";

const depositModalRef = ref<HTMLDivElement | null>(null);
const withdrawModalRef = ref<HTMLDivElement | null>(null);
const amount = ref(0);
const balance = ref<number | null>(null);
const userId = Number(localStorage.getItem("userId"));
if (!userId) alert("กรุณา login ก่อน");

// call balance backend
const getBalance = async () => {
  try {
    const res = await axios.get(`http://localhost:3000/api/users/${userId}`);
    balance.value = res.data.balance;
  } catch (err) {
    console.error(err);
  }
};

onMounted(() => {
  getBalance();
});

const showDepositModal = () => {
  if (amount.value <= 0 || amount.value > 100000) {
    return alert("จำนวนเงินฝากต้องอยู่ระหว่าง 0-100,000 บาท");
  }
  if (!userId) return alert("กรุณา login ก่อน");

  if (depositModalRef.value) {
    const depositModal = new bootstrap.Modal(depositModalRef.value);
    depositModal.show();
  }
};

const confirmDeposit = async () => {
  try {
    await axios.post("http://localhost:3000/api/deposit", {
      userId,
      amount: amount.value,
    });
    amount.value = 0;
    await getBalance();

    // close modal 
    if (depositModalRef.value) {
      const depositModal = bootstrap.Modal.getInstance(depositModalRef.value);
      depositModal?.hide();
    }

    alert("ฝากเงินสำเร็จ");
  } catch (err) {
    console.error(err);
    alert("Server error");
  }
};

const showWithdrawModal = () => {
  if (amount.value <= 0 || amount.value > 100000) {
    return alert("จำนวนเงินฝากต้องอยู่ระหว่าง 0-100,000 บาท");
  }
  if (!userId) return alert("กรุณา login ก่อน");

  if (withdrawModalRef.value) {
    const withdrawModal = new bootstrap.Modal(withdrawModalRef.value);
    withdrawModal.show();
  }
};

const confirmWithdraw = async () => {
  if (amount.value <= 0) return alert("กรอกจำนวนเงินให้ถูกต้อง");
  try {
    await axios.post("http://localhost:3000/api/withdraw", { userId, amount: amount.value });
    amount.value = 0;
    await getBalance();

    if (withdrawModalRef.value) {
      const withdrawModal = bootstrap.Modal.getInstance(withdrawModalRef.value);
      withdrawModal?.hide();
    }

    alert("ถอนเงินสำเร็จ");
  } catch (err: any) {
    console.error(err);
    alert(err.response?.data?.message || "Server error");
  }
};
</script>
