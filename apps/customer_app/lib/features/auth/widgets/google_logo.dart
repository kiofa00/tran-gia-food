import 'dart:math' as math;
import 'package:flutter/material.dart';

/// Vector CustomPainter rendering the official 4-color Google 'G' brand mark
class GoogleLogo extends StatelessWidget {
  final double size;

  const GoogleLogo({super.key, this.size = 20});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(
        painter: _GoogleLogoPainter(),
      ),
    );
  }
}

class _GoogleLogoPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final double cx = size.width / 2;
    final double cy = size.height / 2;
    final double radius = math.min(cx, cy);
    final double strokeWidth = radius * 0.44;
    final double arcRadius = radius - (strokeWidth / 2);

    final rect = Rect.fromCircle(center: Offset(cx, cy), radius: arcRadius);

    final paintRed = Paint()
      ..color = const Color(0xFFEA4335)
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.butt;

    final paintYellow = Paint()
      ..color = const Color(0xFFFBBC05)
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.butt;

    final paintGreen = Paint()
      ..color = const Color(0xFF34A853)
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.butt;

    final paintBlue = Paint()
      ..color = const Color(0xFF4285F4)
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.butt;

    // Top arc (Red): ~ 190° to 315°
    canvas.drawArc(rect, -math.pi * 0.72, math.pi * 0.54, false, paintRed);
    // Left arc (Yellow): ~ 130° to 195°
    canvas.drawArc(rect, math.pi * 0.72, math.pi * 0.38, false, paintYellow);
    // Bottom arc (Green): ~ 45° to 130°
    canvas.drawArc(rect, math.pi * 0.20, math.pi * 0.54, false, paintGreen);
    // Right arc (Blue): ~ -45° to 45°
    canvas.drawArc(rect, -math.pi * 0.20, math.pi * 0.40, false, paintBlue);

    // Blue horizontal center-right bar
    final barPaint = Paint()
      ..color = const Color(0xFF4285F4)
      ..style = PaintingStyle.fill;
    final barRect = Rect.fromLTWH(
      cx - (strokeWidth * 0.2),
      cy - (strokeWidth / 2),
      radius * 0.95,
      strokeWidth,
    );
    canvas.drawRect(barRect, barPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
