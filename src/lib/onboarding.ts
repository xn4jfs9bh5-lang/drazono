import type { SupabaseClient } from '@supabase/supabase-js'
import { WHATSAPP_NUMBER } from '@/lib/constants'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.drazono.com'

export async function scheduleOnboardingSequence(
  supabase: SupabaseClient,
  userId: string,
) {
  const now = Date.now()
  const steps = [
    { key: 'how_it_works_d3', delay: 3 },
    { key: 'top_vehicles_d7', delay: 7 },
    { key: 'checkin_d14', delay: 14 },
  ]

  const rows = steps.map(s => ({
    user_id: userId,
    sequence_name: 'onboarding',
    step_key: s.key,
    scheduled_for: new Date(now + s.delay * 86400000).toISOString(),
    status: 'pending' as const,
  }))

  await supabase.from('user_email_sequences').insert(rows)
}

function emailWrapper(content: string, unsubEmail: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:system-ui,-apple-system,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 16px">
<tr><td align="center">
<table width="100%" style="max-width:560px;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">
<tr><td style="background:#0A1325;padding:20px 24px;text-align:center">
<span style="color:#1845CC;font-weight:800;font-size:22px">D</span><span style="color:#fff;font-weight:800;font-size:22px">RAZONO</span>
</td></tr>
<tr><td style="padding:24px">
${content}
<p style="margin-top:20px"><a href="https://wa.me/${WHATSAPP_NUMBER}" style="display:inline-block;background:#25D366;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">Nous contacter sur WhatsApp</a></p>
</td></tr>
<tr><td style="padding:0 24px 20px;text-align:center">
<p style="font-size:11px;color:#9ca3af;margin:0"><a href="${SITE_URL}/api/emails/unsubscribe?email=${encodeURIComponent(unsubEmail)}" style="color:#9ca3af">Se desabonner</a></p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
}

export function getWelcomeEmail(name: string, email: string): { subject: string; html: string } {
  return {
    subject: `Bienvenue sur DRAZONO, ${name} !`,
    html: emailWrapper(`
      <h2 style="color:#1845CC;margin:0 0 12px">Bienvenue ${name} !</h2>
      <p>Merci de rejoindre DRAZONO, votre plateforme d'import de vehicules chinois.</p>
      <p>Voici ce que vous pouvez faire :</p>
      <ul style="color:#374151">
        <li>Explorer notre <a href="${SITE_URL}/catalogue" style="color:#1845CC">catalogue</a></li>
        <li>Creer des alertes pour etre notifie des nouveaux vehicules</li>
        <li>Sauvegarder vos favoris</li>
        <li>Obtenir un devis personnalise sur WhatsApp</li>
      </ul>
      <p><a href="${SITE_URL}/catalogue" style="display:inline-block;background:#1845CC;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">Voir le catalogue</a></p>
    `, email),
  }
}

export function getOnboardingTemplate(
  stepKey: string,
  name: string,
  email: string,
): { subject: string; html: string } | null {
  switch (stepKey) {
    case 'how_it_works_d3':
      return {
        subject: 'Comment importer un vehicule depuis la Chine',
        html: emailWrapper(`
          <h2 style="color:#1845CC;margin:0 0 12px">${name}, voici comment ca marche</h2>
          <p>Importer un vehicule avec DRAZONO, c'est simple :</p>
          <ol style="color:#374151">
            <li><strong>Choisissez</strong> un vehicule dans notre catalogue</li>
            <li><strong>Contactez-nous</strong> sur WhatsApp pour les details</li>
            <li><strong>Acompte 10%</strong> pour securiser le vehicule</li>
            <li><strong>Livraison</strong> en 30-60 jours</li>
          </ol>
          <p style="background:#f0fdf4;padding:12px;border-radius:8px;color:#166534;font-size:14px">
            Acompte 100% remboursable si vehicule indisponible
          </p>
          <p><a href="${SITE_URL}/comment-ca-marche" style="display:inline-block;background:#1845CC;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">En savoir plus</a></p>
        `, email),
      }
    case 'top_vehicles_d7':
      return {
        subject: 'Top vehicules disponibles cette semaine',
        html: emailWrapper(`
          <h2 style="color:#1845CC;margin:0 0 12px">${name}, decouvrez nos vehicules</h2>
          <p>Voici les vehicules les plus populaires cette semaine sur DRAZONO :</p>
          <p>BYD, Chery, Haval, MG, Geely... des marques fiables a prix direct usine Chine.</p>
          <p>Les prix sont <strong>2 a 3 fois moins chers</strong> que les equivalents europeens.</p>
          <p><a href="${SITE_URL}/catalogue" style="display:inline-block;background:#1845CC;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">Voir le catalogue</a></p>
        `, email),
      }
    case 'checkin_d14':
      return {
        subject: `${name}, vous avez trouve votre vehicule ?`,
        html: emailWrapper(`
          <h2 style="color:#1845CC;margin:0 0 12px">On est la pour vous aider</h2>
          <p>Bonjour ${name},</p>
          <p>Vous avez cree votre compte il y a 2 semaines. Avez-vous trouve le vehicule qu'il vous faut ?</p>
          <p>Si vous avez des questions, n'hesitez pas a nous contacter sur WhatsApp. Reponse en moins de 2h !</p>
          <p>Vous pouvez aussi configurer une <a href="${SITE_URL}/espace-client" style="color:#1845CC">alerte</a> pour etre notifie automatiquement.</p>
        `, email),
      }
    default:
      return null
  }
}
