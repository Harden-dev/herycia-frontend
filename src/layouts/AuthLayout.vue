<script setup lang="ts">
import '@/assets/auth.css'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AuthBrandPanel from '@/components/auth/AuthBrandPanel.vue'
import HeryciaLogo from '@/components/brand/HeryciaLogo.vue'

const route = useRoute()
const isLogin = computed(() => route.name === 'login')
const isPasswordReset = computed(() => route.name === 'forgot-password')
const registerTo = computed(() =>
  route.query.plan ? `/register?plan=${route.query.plan}` : '/register',
)
const formMaxWidth = computed(() =>
  isLogin.value || isPasswordReset.value ? 'max-w-[420px]' : 'max-w-[580px]',
)
</script>

<template>
  <div class="auth-page flex min-h-screen bg-card">
    <!-- Left — form -->
    <div class="flex flex-1 flex-col px-6 py-8 sm:px-10 lg:px-14 lg:py-10">
      <div class="mx-auto flex w-full flex-1 flex-col justify-center py-10" :class="formMaxWidth">
        <RouterLink
          to="/"
          class="mb-8 flex justify-center transition-opacity hover:opacity-90"
        >
          <HeryciaLogo size="lg" />
        </RouterLink>

        <div class="mb-8">
          <h1 class="text-[28px] font-bold leading-tight text-foreground md:text-[32px]">
            Bienvenue sur Herycia
          </h1>
          <p class="mt-2 text-sm leading-relaxed text-muted-foreground">
            Gérez votre salon — connectez-vous ou créez votre compte pour commencer.
          </p>
        </div>

        <nav v-if="!isPasswordReset" class="auth-tabs" aria-label="Connexion ou inscription">
          <RouterLink to="/login" class="auth-tab" :class="{ 'auth-tab-active': isLogin }">
            Connexion
          </RouterLink>
          <RouterLink :to="registerTo" class="auth-tab" :class="{ 'auth-tab-active': !isLogin }">
            Inscription
          </RouterLink>
        </nav>

        <RouterView />

        <p class="mt-10 text-center text-xs text-muted-foreground">
          © {{ new Date().getFullYear() }} Herycia ·
          <a href="#" class="underline-offset-2 hover:underline">Conditions</a>
          ·
          <a href="#" class="underline-offset-2 hover:underline">Confidentialité</a>
        </p>
      </div>
    </div>

    <!-- Right — brand -->
    <AuthBrandPanel />
  </div>
</template>
