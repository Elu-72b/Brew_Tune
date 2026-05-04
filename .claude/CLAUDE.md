# CLAUDE.md 

## 1. よく使うコマンド

すべて `docker compose exec web [command]` 経由で実行。

- Test: `bundle exec rspec`
- DB: `bin/rails db:migrate`
- CSS: `bin/rails tailwindcss:build`
- Console: `bin/rails console`

## 2. 開発・設計の基本方針

- **Thin Controller**: ロジックは Service または Model へ。
- **2-Step Flow**: 配合と感想を別アクションで保存する仕様を厳守。
- **Unit Logic**: `recipe_herbs.unit` (g/tsp) の管理ロジックを尊重。
- **N+1 Prevention**: 関連取得時は `includes` 必須。

## 3. Git の作業ルール

ブランチ: `feature/#[issue_no]-[summary]`
Prefix: `feat`, `fix`, `docs`, `style`, `refactor`, `test`

## 6. Claude Code への禁止事項

- テーブルの削除・カラムの削除を含むマイグレーション（要ユーザー確認）
- `issue_mvp.md`, `issue_full.md` に記載のない新機能の追加
- `db/seeds.rb` の上書き
- 既存テストの削除

---

## 7. 効率的な動作とトークン節約 (Efficiency & Performance)

エージェントの実行速度向上とトークン消費削減のため、以下の動作を徹底してください。

- **重複アクセスの禁止**: 一度読み込んだファイルの内容は記憶し、変更がない限り短時間に何度も読み直さない。
- **検索の最適化**: 広い範囲を `read_file` する前に、`grep_search` や `glob` を使用して対象を絞り込む。
- **ターンの統合**: 関連する調査や編集は、可能な限り1回のツール実行（並列呼び出し）にまとめる。
- **最小限の出力**: ユーザーから求められない限り、実行結果の長い要約や挨拶を省き、技術的な意図と結果のみを簡潔に伝える。
- **差分編集の優先**: ファイル全体の上書きよりも、特定の箇所を狙った `replace` を優先し、コンテキスト負荷を下げる。
