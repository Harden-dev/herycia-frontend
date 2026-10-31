<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { IconKey, IconLock, IconMail } from '@tabler/icons-vue'
import AuthField from '@/components/auth/AuthField.vue'
import { extractValidationErrors, getApiErrorMessage } from '@/lib/api'
import {
  forgotPasswordRequest,
  resetPasswordRequest,
  verifyResetCodeRequest,
} from '@/services/auth.service'

type Step = 'email' | 'code' | 'password'

const router = useRouter()

const step = ref<Step>('email')
const email = ref('')
const code = ref('')
const resetToken = ref('')
const password = ref('')
const passwordConfirmation = ref('')

const loading = ref(false)
const error = ref<string | null>(null)
const info = ref<string | null>(null)
const fieldErrors = ref<Record<string, string>>({})

/** Règles identiques au backend (ResetPasswordRequest). */
const passwordRules = computed(() => [
  { label: '8 caractères minimum', ok: password.value.length >= 8 },
  {
    label: 'Une majuscule et une minuscule',
    ok: /[a-z]/.test(password.value) && /[A-Z]/.test(password.value),
  },
  { label: 'Un chiffre', ok: /\d/.test(password.value) },
  { label: 'Un symbole (ex. ! ? @ #)', ok: /[^A-Za-z0-9]/.test(password.value) },
])
const passwordValid = computed(() => passwordRules.value.every((rule) => rule.ok))

const subtitle = computed(() => {
  if (step.value === 'email') {
    return 'Saisissez l’adresse email de votre compte pour recevoir un code de réinitialisation.'
  }
  if (step.value === 'code') {
    return `Saisissez le code à 6 chiffres envoyé à ${email.value}.`
  }
  return 'Choisissez votre nouveau mot de passe.'
})

function resetMessages() {
  error.value = null
  info.value = null
  fieldErrors.value = {}
}

function handleError(e: unknown) {
  fieldErrors.value = extractValidationErrors(e) ?? {}
  error.value = Object.keys(fieldErrors.value).length ? null : getApiErrorMessage(e)
}

async function sendCode() {
  resetMessages()
  loading.value = true
  try {
    const response = await forgotPasswordRequest(email.value.trim().toLowerCase())
    email.value = email.value.trim().toLowerCase()
    info.value = response.message
    code.value = ''
    step.value = 'code'
  } catch (e) {
    handleError(e)
  } finally {
    loading.value = false
  }
}

async function verifyCode() {
  resetMessages()
  loading.value = true
  try {
    const response = await verifyResetCodeRequest(email.value, code.value.trim())
    resetToken.value = response.data.token
    step.value = 'password'
  } catch (e) {
    handleError(e)
  } finally {
    loading.value = false
  }
}

async function savePassword() {
  resetMessages()
  if (!passwordValid.value) {
    error.value = 'Le mot de passe ne respecte pas toutes les règles.'
    return
  }
  if (password.value !== passwordConfirmation.value) {
    fieldErrors.value = { password_confirmation: 'La confirmation ne correspond pas.' }
    return
  }

  loading.value = true
  try {
    await resetPasswordRequest({
      token: resetToken.value,
      email: email.value,
      password: password.value,
      password_confirmation: passwordConfirmation.value,
    })
    await router.push({ name: 'login', query: { reset: 'success' } })
  } catch (e) {
    handleError(e)
    // Jeton expiré ou invalide : il faut recommencer depuis l'envoi du code.
    if (!Object.keys(fieldErrors.value).length) {
      step.value = 'email'
    }
  } finally {
    loading.value = false
  }
}

function backToEmail() {
  resetMessages()
  step.value = 'email'
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <div>
      <h2 class="text-lg font-semibold text-foreground">Mot de passe oublié</h2>
      <p class="mt-1 text-sm text-muted-foreground">{{ subtitle }}</p>
    </div>

    <p v-if="error" class="rounded-lg bg-danger-50 px-3 py-2 text-xs text-danger-800" role="alert">
      {{ error }}
    </p>
    <p
      v-if="info"
      class="rounded-lg bg-primary-50 px-3 py-2 text-xs text-primary-800"
      role="status"
    >
      {{ info }}
    </p>

    <!-- Étape 1 : email -->
    <form v-if="step === 'email'" class="flex flex-col gap-5" @submit.prevent="sendCode">
      <AuthField
        id="reset-email"
        v-model="email"
        label="Adresse email"
        type="email"
        placeholder="vous@exemple.com"
        required
        :icon="IconMail"
        :error="fieldErrors.email"
      />
      <p class="text-xs text-muted-foreground">
        La réinitialisation se fait par email. Si votre compte n’a pas d’adresse email, demandez à
        l’administrateur de votre salon de réinitialiser votre mot de passe.
      </p>
      <button type="submit" class="auth-submit" :disabled="loading">
        {{ loading ? 'Envoi…' : 'Recevoir un code' }}
      </button>
    </form>

    <!-- Étape 2 : code -->
    <form v-else-if="step === 'code'" class="flex flex-col gap-5" @submit.prevent="verifyCode">
      <AuthField
        id="reset-code"
        v-model="code"
        label="Code de vérification"
        type="text"
        placeholder="123456"
        required
        :icon="IconKey"
        :error="fieldErrors.code"
      />
      <button type="submit" class="auth-submit" :disabled="loading || code.trim().length !== 6">
        {{ loading ? 'Vérification…' : 'Vérifier le code' }}
      </button>
      <div class="flex items-center justify-between text-xs">
        <button
          type="button"
          class="font-medium text-primary-600 hover:text-primary-800"
          @click="backToEmail"
        >
          Changer d’email
        </button>
        <button
          type="button"
          class="font-medium text-primary-600 hover:text-primary-800 disabled:opacity-50"
          :disabled="loading"
          @click="sendCode"
        >
          Renvoyer un code
        </button>
      </div>
    </form>

    <!-- Étape 3 : nouveau mot de passe -->
    <form v-else class="flex flex-col gap-5" @submit.prevent="savePassword">
      <AuthField
        id="reset-password"
        v-model="password"
        label="Nouveau mot de passe"
        type="password"
        placeholder="Nouveau mot de passe"
        required
        :icon="IconLock"
        :error="fieldErrors.password"
      />
      <ul class="flex flex-col gap-1 text-xs" aria-label="Règles du mot de passe">
        <li
          v-for="rule in passwordRules"
          :key="rule.label"
          :class="rule.ok ? 'text-primary-700' : 'text-muted-foreground'"
        >
          {{ rule.ok ? '✓' : '•' }} {{ rule.label }}
        </li>
      </ul>
      <AuthField
        id="reset-password-confirmation"
        v-model="passwordConfirmation"
        label="Confirmer le mot de passe"
        type="password"
        placeholder="Confirmez le mot de passe"
        required
        :icon="IconLock"
        :error="fieldErrors.password_confirmation"
      />
      <button type="submit" class="auth-submit" :disabled="loading">
        {{ loading ? 'Enregistrement…' : 'Changer le mot de passe' }}
      </button>
    </form>

    <RouterLink
      to="/login"
      class="text-center text-xs font-medium text-primary-600 hover:text-primary-800"
    >
      Retour à la connexion
    </RouterLink>
  </div>
</template>
