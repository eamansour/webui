/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
"use server";

import { cookies } from 'next/headers';
import { Locale } from '@/i18n/config';

// In this example the locale is read from a cookie. You could alternatively
// also read it from a database, backend service, or any other source.
const COOKIE_NAME = 'NEXT_LOCALE';

export async function setUserLocale(locale: Locale) {
  cookies().set(COOKIE_NAME, locale);
}
