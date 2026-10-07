<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { IconLock, IconPhone } from '@tabler/icons-vue'
import AuthField from '@/components/auth/AuthField.vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

/** Retour du parcours « mot de passe oublié ». */
const passwordReset = route.query.reset === 'success'

const login = ref('')
const password = ref('')

async function onSubmit() {
  try {
    await authStore.login({ login: login.value, password: password.value })
    const dest = authStore.role === 'super_admin' ? '/admin' : '/dashboard'
    await router.push(dest)
  } catch {
    // error affiché via authStore.error
  }
}
</script>

<template>
  <form class="flex flex-col gap-5" @submit.prevent="onSubmit">
    <p v-if="authStore.error" class="rounded-lg bg-danger-50 px-3 py-2 text-xs text-danger-800">
      {{ authStore.error }}
    </p>
    <p
      v-else-if="passwordReset"
      class="rounded-lg bg-primary-50 px-3 py-2 text-xs text-primary-800"
      role="status"
    >
      Mot de passe modifié. Connectez-vous avec votre nouveau mot de passe.
    </p>

    <AuthField
      id="login"
      v-model="login"
      label="Numéro de téléphone"
      type="tel"
      placeholder="2250708112233"
      required
      :icon="IconPhone"
    />

    <AuthField
      id="password"
      v-model="password"
      label="Mot de passe"
      type="password"
      placeholder="Entrez votre mot de passe"
      required
      :icon="IconLock"
    />

    <div class="flex justify-end">
      <RouterLink
        :to="{ name: 'forgot-password' }"
        class="text-xs font-medium text-primary-600 hover:text-primary-800"
      >
        Mot de passe oublié ?
      </RouterLink>
    </div>

    <button type="submit" class="auth-submit mt-1" :disabled="authStore.loading">
      {{ authStore.loading ? 'Connexion...' : 'Se connecter' }}
    </button>
  </form>
</template>
