import { createRouter, createWebHistory } from 'vue-router'
import { applyRouteSeo } from '@/lib/seo'
import { useAuthStore } from '@/stores/auth'
import { useSubscriptionStore } from '@/stores/subscription'

function defaultAuthedPath(role: string | undefined) {
  return role === 'super_admin' ? '/admin' : '/dashboard'
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: () => import('@/views/LandingPageView.vue'),
      meta: { seo: { index: true } },
    },
    {
      path: '/booking/:slug',
      name: 'salon-booking',
      component: () => import('@/views/public/SalonBookingView.vue'),
      meta: { seo: { title: 'Réserver en ligne', index: true }, publicBooking: true },
    },
    {
      path: '/rdv/:token',
      name: 'rdv-track',
      component: () => import('@/views/public/BookingTrackView.vue'),
      meta: { seo: { title: 'Suivi de rendez-vous' }, publicBooking: true },
    },
    {
      path: '/arrivee/:slug',
      name: 'checkin',
      component: () => import('@/views/public/CheckInView.vue'),
      meta: { seo: { title: 'Arrivée au salon' }, publicBooking: true },
    },
    {
      path: '/file/:token',
      name: 'queue-track',
      component: () => import('@/views/public/QueueTrackView.vue'),
      meta: { seo: { title: 'Votre place dans la file' }, publicBooking: true },
    },
    {
      path: '/login',
      component: () => import('@/layouts/AuthLayout.vue'),
      meta: { guest: true },
      children: [
        {
          path: '',
          name: 'login',
          component: () => import('@/views/auth/LoginView.vue'),
          meta: { seo: { title: 'Connexion' } },
        },
      ],
    },
    {
      path: '/forgot-password',
      component: () => import('@/layouts/AuthLayout.vue'),
      meta: { guest: true },
      children: [
        {
          path: '',
          name: 'forgot-password',
          component: () => import('@/views/auth/ForgotPasswordView.vue'),
          meta: { seo: { title: 'Mot de passe oublié' } },
        },
      ],
    },
    {
      path: '/register',
      component: () => import('@/layouts/AuthLayout.vue'),
      meta: { guest: true },
      children: [
        {
          path: '',
          name: 'register',
          component: () => import('@/views/auth/RegisterView.vue'),
          meta: { seo: { title: 'Créer le compte de votre salon', description: 'Créez le compte de votre salon et essayez gratuitement pendant 7 jours : réservation en ligne, QR d’arrivée et file d’attente.', index: true } },
        },
      ],
    },
    {
      path: '/',
      component: () => import('@/layouts/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/DashboardView.vue'),
        },
        {
          path: 'agenda',
          name: 'agenda',
          component: () => import('@/views/AgendaView.vue'),
        },
        {
          path: 'activity',
          name: 'activity',
          component: () => import('@/views/ActivityView.vue'),
          meta: { requiresAnalytics: true },
        },
        {
          path: 'queue',
          name: 'queue',
          component: () => import('@/views/QueueView.vue'),
        },
        {
          path: 'services',
          name: 'services',
          component: () => import('@/views/ServicesView.vue'),
        },
        {
          path: 'clients',
          name: 'clients',
          component: () => import('@/views/ClientsView.vue'),
        },
        {
          path: 'clients/:id',
          name: 'client-detail',
          component: () => import('@/views/ClientDetailView.vue'),
        },
        {
          path: 'payments',
          name: 'payments',
          component: () => import('@/views/PaymentsView.vue'),
          meta: { roles: ['admin', 'receptionist'] },
        },
        {
          path: 'users',
          name: 'users',
          component: () => import('@/views/UsersView.vue'),
          meta: { roles: ['admin'] },
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('@/views/SettingsView.vue'),
        },
      ],
    },
    {
      path: '/admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { requiresAuth: true, requiresSuperAdmin: true },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: () => import('@/views/admin/AdminDashboardView.vue'),
        },
        {
          path: 'salons',
          name: 'admin-salons',
          component: () => import('@/views/admin/AdminSalonsView.vue'),
        },
        {
          path: 'salons/:id',
          name: 'admin-salon-detail',
          component: () => import('@/views/admin/AdminSalonDetailView.vue'),
        },
        {
          path: 'plans',
          name: 'admin-plans',
          component: () => import('@/views/admin/AdminPlansView.vue'),
        },
        {
          path: 'subscriptions',
          name: 'admin-subscriptions',
          component: () => import('@/views/admin/AdminSubscriptionsView.vue'),
        },
        {
          path: 'billing-payments',
          name: 'admin-billing-payments',
          component: () => import('@/views/admin/AdminBillingPaymentsView.vue'),
        },
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('@/views/admin/AdminUsersView.vue'),
        },
      ],
    },
  ],
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  const role = authStore.role
  const home = defaultAuthedPath(role)

  if (to.name === 'landing' && authStore.token) {
    return { path: home }
  }

  if (to.meta.requiresAuth && !authStore.token) {
    return { path: '/login' }
  }

  if (to.meta.guest && authStore.token) {
    return { path: home }
  }

  const isAdminRoute = to.path.startsWith('/admin')

  if (isAdminRoute && role !== 'super_admin') {
    return { path: '/dashboard' }
  }

  if (to.meta.requiresAuth && role === 'super_admin' && !isAdminRoute && !to.meta.publicBooking) {
    return { path: '/admin' }
  }

  const roles = to.meta.roles as string[] | undefined
  if (roles?.length && role && !roles.includes(role)) {
    return { path: home }
  }

  if (to.meta.requiresAnalytics && role !== 'super_admin') {
    const subStore = useSubscriptionStore()
    if (!subStore.canUseAnalytics) {
      subStore.openUpgradeModal()
      return { path: '/dashboard' }
    }
  }

  if (
    to.meta.requiresAuth &&
    role === 'admin' &&
    to.name !== 'settings' &&
    !to.path.startsWith('/admin')
  ) {
    const subStore = useSubscriptionStore()
    if (!subStore.subscription) await subStore.load()
    if (subStore.blocked) {
      return { name: 'settings', query: { payment: 'required' } }
    }
  }
})

// Titre, description et indexation de chaque page (pages privées en noindex par défaut).
router.afterEach((to) => applyRouteSeo(to))

export default router
