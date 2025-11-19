import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { rows } = await sql`
      SELECT * FROM user_settings WHERE user_id = ${session.user.id}
    `;

    if (rows.length === 0) {
      // Return default settings if not found
      return NextResponse.json({
        autoPreviewMarkdown: true,
        defaultTheme: 'dark',
        showLineNumbers: true,
        fontSize: 'medium',
        enableSyntaxHighlighting: true,
        autoLoadGists: true,
        historyLimit: 10,
        compactMode: false,
        enableAnimations: true,
        wrapLongLines: false,
        telemetryEnabled: false,
        iconSet: 'lucide',
      });
    }

    const settings = rows[0];
    
    return NextResponse.json({
      autoPreviewMarkdown: settings.auto_preview_markdown,
      defaultTheme: settings.default_theme,
      showLineNumbers: settings.show_line_numbers,
      fontSize: settings.font_size,
      enableSyntaxHighlighting: settings.enable_syntax_highlighting,
      autoLoadGists: settings.auto_load_gists,
      historyLimit: settings.history_limit,
      compactMode: settings.compact_mode,
      enableAnimations: settings.enable_animations,
      wrapLongLines: settings.wrap_long_lines,
      telemetryEnabled: settings.telemetry_enabled,
      telemetryApiKey: settings.telemetry_api_key,
      iconSet: settings.icon_set,
    });
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await request.json();

    // Upsert user settings
    await sql`
      INSERT INTO user_settings (
        user_id,
        telemetry_enabled,
        telemetry_api_key,
        auto_preview_markdown,
        default_theme,
        show_line_numbers,
        font_size,
        enable_syntax_highlighting,
        auto_load_gists,
        history_limit,
        compact_mode,
        enable_animations,
        wrap_long_lines,
        icon_set,
        updated_at
      ) VALUES (
        ${session.user.id},
        ${settings.telemetryEnabled ?? false},
        ${settings.telemetryApiKey ?? null},
        ${settings.autoPreviewMarkdown ?? true},
        ${settings.defaultTheme ?? 'dark'},
        ${settings.showLineNumbers ?? true},
        ${settings.fontSize ?? 'medium'},
        ${settings.enableSyntaxHighlighting ?? true},
        ${settings.autoLoadGists ?? true},
        ${settings.historyLimit ?? 10},
        ${settings.compactMode ?? false},
        ${settings.enableAnimations ?? true},
        ${settings.wrapLongLines ?? false},
        ${settings.iconSet ?? 'lucide'},
        CURRENT_TIMESTAMP
      )
      ON CONFLICT (user_id) DO UPDATE SET
        telemetry_enabled = EXCLUDED.telemetry_enabled,
        telemetry_api_key = EXCLUDED.telemetry_api_key,
        auto_preview_markdown = EXCLUDED.auto_preview_markdown,
        default_theme = EXCLUDED.default_theme,
        show_line_numbers = EXCLUDED.show_line_numbers,
        font_size = EXCLUDED.font_size,
        enable_syntax_highlighting = EXCLUDED.enable_syntax_highlighting,
        auto_load_gists = EXCLUDED.auto_load_gists,
        history_limit = EXCLUDED.history_limit,
        compact_mode = EXCLUDED.compact_mode,
        enable_animations = EXCLUDED.enable_animations,
        wrap_long_lines = EXCLUDED.wrap_long_lines,
        icon_set = EXCLUDED.icon_set,
        updated_at = CURRENT_TIMESTAMP
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save settings:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}
