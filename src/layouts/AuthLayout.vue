<script setup lang="ts">
import '@/assets/auth.css'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AuthBrandPanel from '@/components/auth/AuthBrandPanel.vue'
import BrandLogo from '@/components/brand/BrandLogo.vue'

const route = useRoute()
const isLogin = computed(() => route.name === 'login')
const isRegister = computed(() => route.name === 'register')
const registerTo = computed(() =>
  route.query.plan ? `/register?plan=${route.query.plan}` : '/register',
)
const formMaxWidth = computed(() => (isRegister.value ? 'max-w-[560px]' : 'max-w-[400px]'))

/** Titre propre à chaque écran ; « mot de passe oublié » porte le sien. */
const heading = computed(() => {
  if (isLogin.value) {
    return { title: 'Connexion', text: 'Accédez à l’espace de gestion de votre salon.' }
  }
  if (isRegister.value) {
    return {
      title: 'Créer le compte de votre salon',
      text: 'Quelques informations suffisent pour commencer.',
    }
  }
  return null
})
</script>

<template>
  <div class="auth-page flex min-h-screen bg-card">
    <div class="flex flex-1 flex-col px-6 py-8 sm:px-10 lg:px-16">
      <RouterLink to="/" class="w-fit rounded-lg" aria-label="MANYAN, retour à l’accueil">
        <BrandLogo size="lg" />
      </RouterLink>

      <main class="mx-auto flex w-full flex-1 flex-col justify-center py-12" :class="formMaxWidth">
        <div v-if="heading" class="mb-8">
          <h1 class="text-2xl font-semibold text-foreground md:text-[28px]">
            {{ heading.title }}
          </h1>
          <p class="mt-2 text-sm text-muted-foreground">{{ heading.text }}</p>
        </div>

        <RouterView />

        <p v-if="isLogin" class="mt-8 text-center text-sm text-muted-foreground">
          Pas encore de compte ?
          <RouterLink :to="registerTo" class="font-medium text-primary-600 hover:text-primary-800">
            Créer un compte
          </RouterLink>
        </p>
        <p v-else-if="isRegister" class="mt-8 text-center text-sm text-muted-foreground">
          Déjà un compte ?
          <RouterLink to="/login" class="font-medium text-primary-600 hover:text-primary-800">
            Se connecter
          </RouterLink>
        </p>
      </main>

      <p class="text-xs text-muted-foreground">© {{ new Date().getFullYear() }} MANYAN</p>
    </div>

    <AuthBrandPanel />
  </div>
</template>
