export const styles = `
body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
.email-container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.email-header { background-color: #9D2449; color: #ffffff; padding: 30px 20px; text-align: center; }
.email-header h1 { margin: 0; font-size: 24px; font-weight: 600; }
.email-body { padding: 30px 20px; }
.info-box { background-color: #f8f9fa; border-left: 4px solid #9D2449; padding: 15px; margin: 20px 0; border-radius: 4px; }
.info-row { margin-bottom: 8px; }
.info-label { font-weight: bold; color: #555; min-width: 120px; display: inline-block; }
.email-footer { background-color: #eeeeee; padding: 20px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #e0e0e0; }
@media only screen and (max-width: 600px) {
    .email-container { width: 100%; margin: 0; border-radius: 0; }
    .info-label { display: block; margin-bottom: 2px; }
}
`;