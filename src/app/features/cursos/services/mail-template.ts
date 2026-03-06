import { styles } from "@/app/shared/components/mail/mail-styles.components";

export function getEmailTemplate(title: string, bodyContent: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>${styles}</style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <img src="https://resource.semovioaxaca.gob.mx/assets/images/logo-semovi-horizontal-light.png" alt="SEMOVI" style="max-width: 180px; margin-bottom: 15px; display: block; margin-left: auto; margin-right: auto;">
            <h1>${title}</h1>
        </div>
        <div class="email-body">
            ${bodyContent}
        </div>
        <div class="email-footer">
            <p>Este es un mensaje automático del Sistema de Capacitaciones.</p>
            <p>&copy; ${new Date().getFullYear()} Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>`;
}
