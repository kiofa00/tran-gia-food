import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// Shared scaffold used by all demo pages.
/// Displays a list of [DemoSection] cards with code + result.
class DemoScaffold extends StatelessWidget {
  final String title;
  final Color color;
  final List<DemoSection> sections;

  const DemoScaffold({
    super.key,
    required this.title,
    required this.color,
    required this.sections,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F0F1A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F0F1A),
        foregroundColor: Colors.white,
        title: Text(title,
            style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold)),
        centerTitle: false,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 18),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
        itemCount: sections.length,
        itemBuilder: (context, index) => _SectionCard(
          section: sections[index],
          accentColor: color,
        ),
      ),
    );
  }
}

/// A single demonstration card: label, code snippet, and result.
class DemoSection {
  final String label;
  final String code;
  final String result;
  final Widget? resultWidget;

  const DemoSection({
    required this.label,
    required this.code,
    required this.result,
    this.resultWidget,
  });
}

class _SectionCard extends StatefulWidget {
  final DemoSection section;
  final Color accentColor;

  const _SectionCard({required this.section, required this.accentColor});

  @override
  State<_SectionCard> createState() => _SectionCardState();
}

class _SectionCardState extends State<_SectionCard> {
  bool _copied = false;

  Future<void> _copy() async {
    await Clipboard.setData(ClipboardData(text: widget.section.code));
    setState(() => _copied = true);
    await Future.delayed(const Duration(seconds: 2));
    if (mounted) setState(() => _copied = false);
  }

  @override
  Widget build(BuildContext context) {
    final s = widget.section;
    final color = widget.accentColor;

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: const Color(0xFF1A1A2E),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withValues(alpha: 0.2), width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Header ────────────────────────────────────────
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.12),
              borderRadius:
                  const BorderRadius.vertical(top: Radius.circular(16)),
            ),
            child: Row(
              children: [
                Container(
                  width: 6,
                  height: 6,
                  decoration: BoxDecoration(
                    color: color,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    s.label,
                    style: TextStyle(
                      color: color,
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // ── Code block ────────────────────────────────────
          Stack(
            children: [
              Container(
                width: double.infinity,
                padding: const EdgeInsets.fromLTRB(14, 12, 44, 12),
                color: const Color(0xFF111120),
                child: Text(
                  s.code,
                  style: const TextStyle(
                    color: Color(0xFFCDD3DE),
                    fontSize: 12,
                    fontFamily: 'monospace',
                    height: 1.6,
                  ),
                ),
              ),
              Positioned(
                top: 6,
                right: 6,
                child: GestureDetector(
                  onTap: _copy,
                  child: AnimatedSwitcher(
                    duration: const Duration(milliseconds: 200),
                    child: Icon(
                      _copied ? Icons.check : Icons.copy,
                      key: ValueKey(_copied),
                      color: _copied ? Colors.green : Colors.white38,
                      size: 16,
                    ),
                  ),
                ),
              ),
            ],
          ),

          // ── Result ────────────────────────────────────────
          if (s.result.isNotEmpty || s.resultWidget != null)
            Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.arrow_forward, color: color, size: 14),
                      const SizedBox(width: 6),
                      Text('Result',
                          style: TextStyle(
                              color: color,
                              fontSize: 11,
                              fontWeight: FontWeight.w500)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  if (s.resultWidget != null)
                    s.resultWidget!
                  else
                    Text(
                      s.result,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 13,
                      ),
                    ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
