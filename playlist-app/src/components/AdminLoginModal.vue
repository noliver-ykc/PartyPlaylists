<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal">
      <h2>Admin Login</h2>
      <p class="subtitle">Enter the admin password to create a playlist.</p>
      <form @submit.prevent="submit">
        <input
          v-model="password"
          type="password"
          placeholder="Password"
          :class="{ 'input-error': error }"
          ref="inputRef"
          autocomplete="current-password"
        />
        <p v-if="error" class="error-message">Incorrect password 🙅‍♀️</p>
        <div class="actions">
          <button type="button" class="cancel-btn" @click="$emit('close')">Cancel</button>
          <button type="submit" class="submit-btn">Log In</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAdmin } from '@/composables/useAdmin'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success'): void
}>()

const { login } = useAdmin()
const password = ref('')
const error = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

onMounted(() => inputRef.value?.focus())

const submit = () => {
  if (login(password.value)) {
    error.value = false
    emit('success')
  } else {
    error.value = true
    password.value = ''
  }
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  width: 100%;
  max-width: 360px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.modal h2 {
  margin: 0;
  font-size: 1.25rem;
}

.subtitle {
  margin: 0;
  font-size: 0.875rem;
  color: #666;
}

input {
  width: 100%;
  height: 40px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 0 12px;
  box-sizing: border-box;
}

.input-error {
  border-color: #b53a3a !important;
}

.error-message {
  margin: 0;
  color: #b53a3a;
  font-size: 0.75rem;
  font-weight: bold;
}

.actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 0.5rem;
}

.cancel-btn {
  background: none;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: #666;
}

.submit-btn {
  background: #6c63ff;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
}

.submit-btn:hover {
  background: #5a52d5;
}
</style>
