<template>
  <navbar />
  <div class="container d-flex justify-content-center align-items-center"
    style="min-height: 50vh; flex-direction: column;">
    <div class="w-100" style="max-width: 900px;">
      <label class="fw-bold mb-3">ประวัติรายการฝากถอน</label>
      <div class="table-responsive">
        <table class="table table-bordered table-striped align-middle text-center">
          <thead class="table-dark">
            <tr>
              <th scope="col">Datetime</th>
              <th scope="col">Amount</th>
              <th scope="col">Status</th>
              <th scope="col">Email</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in transactions" :key="item.id">
              <td>{{ item.created_at }}</td>
              <td>{{ item.amount }}</td>
              <td :class="item.type === 'deposit' ? 'text-success' : 'text-danger'">
                {{ item.type === 'deposit' ? 'Deposit' : 'Withdraw' }}
              </td>
              <td>{{ item.email }}</td>
              <td>
                <!-- Type Button-->
                <button 
                  v-if="item.type === 'withdraw'" 
                  @click="deleteTransaction(item.id)" 
                  class="btn btn-sm btn-danger">
                  Delete
                </button>
                <button 
                  v-if="item.type === 'deposit'" 
                  @click="openEditModal(item)" 
                  class="btn btn-sm btn-warning">
                  Edit
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Edit Modal -->
  <div class="modal fade" ref="editModalRef" tabindex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="editModalLabel">แก้ไขจำนวนเงินฝาก</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <label class="form-label">จำนวนเงินใหม่</label>
          <input type="number" v-model.number="editAmount" class="form-control" />
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-dark" data-bs-dismiss="modal">ยกเลิก</button>
          <button type="button" class="btn btn-dark" @click="confirmEdit">ยืนยัน</button>
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

const transactions = ref<any[]>([]);
const editModalRef = ref<HTMLDivElement | null>(null);
let editTransactionId: number | null = null;
let oldAmount: number | null = null;
const editAmount = ref<number>(0);

// ดึง userId จาก localStorage 
const userId = Number(localStorage.getItem("userId"));

const getTransactions = async () => {
  try {
    if (!userId) return;
    const res = await axios.get(`http://localhost:3000/api/transactions/${userId}`);
    transactions.value = res.data;
  } catch (err) {
    console.error(err);
  }
};

onMounted(() => {
  getTransactions();
});

// ลบ transaction 
const deleteTransaction = async (id: number) => {
  try {
    await axios.delete(`http://localhost:3000/api/transactions/${id}`);
    getTransactions();
  } catch (err) {
    console.error(err);
  }
};

// เปิด modal สำหรับแก้ไข deposit
const openEditModal = (item: any) => {
  editTransactionId = item.id;
  editAmount.value = item.amount;
  oldAmount = item.amount; 

  if (editModalRef.value) {
    const modal = new bootstrap.Modal(editModalRef.value);
    modal.show();
  }
};

const confirmEdit = async () => {
  if (!editTransactionId) return;

  try {
    // edit transaction
    await axios.put(`http://localhost:3000/api/transactions/${editTransactionId}`, {
      amount: editAmount.value,
    });

    // refresh table
    await getTransactions();

    //  close modal
    if (editModalRef.value) {
      const modal = bootstrap.Modal.getInstance(editModalRef.value);
      modal?.hide();
    }

    alert("แก้ไขจำนวนเงินสำเร็จ ✅");
  } catch (err) {
    console.error(err);
    alert("Server error");
  }
};

</script>

