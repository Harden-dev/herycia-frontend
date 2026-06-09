<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import { IconArrowLeft } from '@tabler/icons-vue'
import AdminHeader from '@/components/layout/AdminHeader.vue'
import AdminConfirmDialog from '@/components/admin/AdminConfirmDialog.vue'
import AdminSalonEditDialog from '@/components/admin/AdminSalonEditDialog.vue'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getApiErrorMessage } from '@/lib/api'
import {
  SUBSCRIPTION_STATUS_LABELS,
  salonStatusClasses,
  salonStatusLabel,
  subscriptionStatusClasses,
} from '@/lib/admin'
import { toast } from '@/lib/toast'
import { formatDate, formatPhone, isoToDMY } from '@/lib/utils'
import {
  deactivateAdminSalon,
  fetchAdminSalon,
  suspendAdminSalon,
} from '@/services/admin.service'
import type { AdminSalonListItem } from '@/types/admin'

const route = useRoute()
const router = useRouter()
const salon = ref<AdminSalonListItem | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const editOpen = ref(false)
const confirmOpen = ref(false)
const confirmLoading = ref(false)
const confirmAction = ref<'suspend' | 'deactivate' | null>(null)

const salonId = computed(() => route.params.id as string)

async function load() {
  loading.value = true
  error.value = null
  try {
    const response = await fetchAdminSalon(salonId.value)
    if (!response.success) throw new Error(response.message)
    salon.value = response.data
  } catch (e) {
    error.value = getApiErrorMessage(e)
  } finally {
    loading.value = false
  }
}

watch(salonId, load, { immediate: true })

onBeforeRouteLeave(() => {
  editOpen.value = false
  confirmOpen.value = false
})

const confirmDialog = computed(() => {
  if (!confirmAction.value) return null
  return confirmAction.value === 'suspend'
    ? {
        title: 'Suspendre le salon',
        description: 'Le salon sera marqué comme suspendu.',
        label: 'Suspendre',
      }
    : {
        title: 'Désactiver le salon',
        description: 'Le salon ne pourra plus être utilisé.',
        label: 'Désactiver',
      }
})

async function onConfirm() {
  if (!salon.value || !confirmAction.value) return
  confirmLoading.value = true
  try {
    const response =
      confirmAction.value === 'suspend'
        ? await suspendAdminSalon(salon.value.id)
        : await deactivateAdminSalon(salon.value.id)
    if (!response.success) throw new Error(response.message)
    toast.success(response.message)
    confirmOpen.value = false
    await load()
  } catch (e) {
    toast.error(getApiErrorMessage(e))
  } finally {
    confirmLoading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <Button
      variant="ghost"
      class="w-fit gap-2 text-muted-foreground"
      @click="router.push('/admin/salons')"
    >
      <IconArrowLeft :size="16" />
      Retour aux salons
    </Button>

    <template v-if="loading">
      <Skeleton class="h-8 w-64" />
      <Skeleton class="h-48 w-full rounded-xl" />
    </template>

    <template v-else-if="salon">
      <AdminHeader :title="salon.name" :description="salon.slug">
        <template #actions>
          <Button variant="outline" @click="editOpen = true">Modifier</Button>
          <Button
            v-if="!salon.is_suspended"
            variant="outline"
            class="text-warning-700"
            @click="confirmAction = 'suspend'; confirmOpen = true"
          >
            Suspendre
          </Button>
          <Button
            v-if="salon.is_active"
            variant="outline"
            class="text-danger-700"
            @click="confirmAction = 'deactivate'; confirmOpen = true"
          >
            Désactiver
          </Button>
        </template>
      </AdminHeader>

      <div class="grid gap-4 md:grid-cols-2">
        <div class="rounded-xl border border-border bg-card p-5">
          <h2 class="text-sm font-medium text-foreground">Informations</h2>
          <dl class="mt-4 space-y-3 text-sm">
            <div class="flex justify-between gap-4">
              <dt class="text-muted-foreground">Ville</dt>
              <dd class="font-medium text-foreground">{{ salon.city }}</dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt class="text-muted-foreground">Téléphone</dt>
              <dd class="font-mono text-foreground">
                {{ salon.phone ? formatPhone(salon.phone) : '—' }}
              </dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt class="text-muted-foreground">WhatsApp</dt>
              <dd class="font-mono text-foreground">
                {{ salon.whatsapp_number ? formatPhone(salon.whatsapp_number) : '—' }}
              </dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt class="text-muted-foreground">Créé le</dt>
              <dd class="text-foreground">{{ formatDate(salon.created_at) }}</dd>
            </div>
          </dl>
        </div>

        <div class="rounded-xl border border-border bg-card p-5">
          <h2 class="text-sm font-medium text-foreground">Abonnement</h2>
          <dl class="mt-4 space-y-3 text-sm">
            <div class="flex justify-between gap-4">
              <dt class="text-muted-foreground">Plan</dt>
              <dd class="text-foreground">
                {{ salon.plan_name ?? '—' }}
                <span v-if="salon.plan_code" class="text-muted-foreground">
                  ({{ salon.plan_code }})
                </span>
              </dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt class="text-muted-foreground">Expiration</dt>
              <dd class="text-foreground">
                {{ salon.subscription_ends_at ? isoToDMY(salon.subscription_ends_at) : '—' }}
              </dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt class="text-muted-foreground">Statut salon</dt>
              <dd>
                <span
                  class="inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium"
                  :class="salonStatusClasses(salon)"
                >
                  {{ salonStatusLabel(salon) }}
                </span>
              </dd>
            </div>
            <div v-if="salon.subscription_status" class="flex justify-between gap-4">
              <dt class="text-muted-foreground">Statut abonnement</dt>
              <dd>
                <span
                  class="inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium"
                  :class="subscriptionStatusClasses(salon.subscription_status)"
                >
                  {{ SUBSCRIPTION_STATUS_LABELS[salon.subscription_status] }}
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </template>

    <p v-if="error" class="rounded-lg bg-danger-50 px-4 py-3 text-sm text-danger-800">
      {{ error }}
    </p>

    <AdminSalonEditDialog v-model:open="editOpen" v-model:salon="salon" @saved="load" />

    <AdminConfirmDialog
      v-if="confirmDialog"
      v-model:open="confirmOpen"
      :title="confirmDialog.title"
      :description="confirmDialog.description"
      :confirm-label="confirmDialog.label"
      :loading="confirmLoading"
      destructive
      @confirm="onConfirm"
    />
  </div>
</template>
