const ERROR_MESSAGES: Record<string, string> = {
  validation_failed: 'Gönderilen bilgiler doğrulanamadı.',
  forbidden: 'Bu işlem için yetkiniz yok.',
  unauthorized: 'Bu işlemi yapmak için giriş yapmanız gerekiyor.',
  not_found: 'İstenen kayıt bulunamadı.',
  conflict: 'Bu işlem mevcut veriyle çakışıyor.',
  invalid_operation: 'İşlem şu anda gerçekleştirilemiyor.',
  unexpected_error: 'Beklenmeyen bir hata oluştu.',

  authentication_required: 'Bu işlem için giriş yapmanız gerekiyor.',
  login_required: 'Devam etmek için giriş yapmanız gerekiyor.',
  user_not_found: 'Kullanıcı bulunamadı.',
  email_already_in_use: 'Bu e-posta zaten kullanımda.',
  current_password_incorrect: 'Mevcut şifre hatalı.',
  google_sign_in_only: 'Bu hesap yalnızca Google ile giriş kullanıyor.',
  invalid_token: 'Geçersiz veya süresi dolmuş işlem bağlantısı.',

  invalid_credentials: 'E-posta veya şifre hatalı.',
  account_locked: 'Hesabınız geçici olarak kilitlendi. Lütfen daha sonra tekrar deneyin.',
  email_not_verified: 'E-posta adresiniz henüz doğrulanmamış.',
  refresh_token_required: 'Oturum yenileme bilgisi eksik.',
  invalid_refresh_token: 'Oturum süresi doldu. Lütfen tekrar giriş yapın.',
  two_factor_required: 'Devam etmek için 2FA kodu gerekli.',
  two_factor_invalid: '2FA kodu geçersiz.',
  two_factor_not_initialized: '2FA henüz kurulmamış.',

  post_not_found: 'Yazı bulunamadı.',
  post_not_published: 'Yazı henüz yayınlanmamış.',
  post_slug_exists: 'Bu bağlantı adı zaten kullanılıyor.',
  post_create_forbidden: 'Yazı oluşturma yetkiniz yok.',
  post_edit_forbidden: 'Bu yazıyı düzenleme yetkiniz yok.',
  post_delete_forbidden: 'Bu yazıyı silme yetkiniz yok.',

  category_not_found: 'Kategori bulunamadı.',
  category_slug_exists: 'Bu kategori bağlantı adı zaten kullanılıyor.',
  category_has_posts: 'İçinde yazı olan kategori silinemez.',

  comment_not_found: 'Yorum bulunamadı.',
  comment_not_approved: 'Yorum henüz onaylanmamış.',
  invalid_status: 'Geçersiz durum değeri.',
  parent_comment_not_found: 'Yanıtlanacak üst yorum bulunamadı.',
  parent_comment_post_mismatch: 'Üst yorum başka bir yazıya ait.',
  reply_depth_limit_exceeded: 'Yanıt derinlik sınırı aşıldı.',

  author_profile_not_found: 'Yazar profili bulunamadı.',
  author_not_found: 'Yazar bulunamadı.',
  settings_not_initialized: 'Sistem ayarları henüz başlatılmamış.',
};

export function resolveErrorMessageFromCode(code?: string): string | undefined {
  if (!code) return undefined;
  return ERROR_MESSAGES[code];
}
