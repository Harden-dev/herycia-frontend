#!/usr/bin/env bash
# Exécuté sur le VPS par le workflow de déploiement (envoyé via SSH, rien à installer).
#
#   remote.sh switch   <chemin> <version>   active releases/<version> et garde les 5 dernières
#   remote.sh rollback <chemin>             réactive la version précédente
#
# Arborescence : <chemin>/releases/<version>/  et  <chemin>/current -> releases/<version>
set -euo pipefail

KEEP=5
action="${1:?action manquante}"
base="${2:?chemin manquant}"
cd "$base"

activate() {
  # Bascule atomique : le nouveau lien remplace l'ancien en une seule opération.
  ln -sfn "releases/$1" current.tmp
  mv -Tf current.tmp current
  echo "Version active : $1"
}

case "$action" in
  switch)
    release="${3:?version manquante}"
    [ -f "releases/$release/index.html" ] || { echo "releases/$release/index.html introuvable" >&2; exit 1; }
    activate "$release"
    # Nettoyage : on garde les $KEEP versions les plus récentes (noms horodatés, tri lexical).
    ls -1 releases | sort | head -n -"$KEEP" | while read -r old; do
      [ "releases/$old" = "$(readlink current)" ] || rm -rf -- "releases/$old"
    done
    ;;
  rollback)
    current="$(basename "$(readlink current)")"
    previous="$(ls -1 releases | sort | grep -B1 -x -- "$current" | head -n 1)"
    if [ -z "$previous" ] || [ "$previous" = "$current" ]; then
      echo "Aucune version précédente à réactiver." >&2
      exit 1
    fi
    activate "$previous"
    ;;
  *)
    echo "Action inconnue : $action" >&2
    exit 1
    ;;
esac
