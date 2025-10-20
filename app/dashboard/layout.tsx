import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import Layout from '@/components/layout/layout';
import Provider from '@/providers/provider';

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={``}>
        <NextIntlClientProvider messages={messages}>
          <Provider>
            <Layout>{children}</Layout>
          </Provider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
