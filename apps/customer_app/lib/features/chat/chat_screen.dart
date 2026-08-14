import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';
import '../../../core/providers/api_client_provider.dart';

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

final chatMessagesProvider = FutureProvider.autoDispose
    .family<List<Map<String, dynamic>>, String>((ref, orderId) async {
  final api = ref.read(apiClientProvider);
  final result = await api.get('/chat/$orderId/messages');
  final list = result['data'] as List? ?? [];
  return list.cast<Map<String, dynamic>>();
});

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class ChatScreen extends ConsumerStatefulWidget {
  final String orderId;
  final String recipientName;

  /// 'shipper' | 'restaurant'
  final String recipientType;

  const ChatScreen({
    super.key,
    required this.orderId,
    required this.recipientName,
    this.recipientType = 'shipper',
  });

  @override
  ConsumerState<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends ConsumerState<ChatScreen> {
  final _messageController = TextEditingController();
  final _scrollController = ScrollController();
  bool _isSending = false;

  // Mock messages khi API chÆ°a cÃ³ dá»¯ liá»‡u
  final List<Map<String, dynamic>> _localMessages = [
    {
      'id': '1',
      'from': 'other',
      'text': 'ChÃ o báº¡n! TÃ´i Ä‘ang trÃªn Ä‘Æ°á»ng Ä‘áº¿n quÃ¡n láº¥y Ä‘á»“.',
      'time': '16:30',
      'type': 'text',
    },
    {
      'id': '2',
      'from': 'me',
      'text': 'Ok báº¡n nhÃ©! MÃ¬nh á»Ÿ Ä‘áº§u ngÃµ 45.',
      'time': '16:31',
      'type': 'text',
    },
    {
      'id': '3',
      'from': 'other',
      'text': 'TÃ´i tá»›i nÆ¡i rá»“i, báº¡n cÃ³ thá»ƒ ra láº¥y khÃ´ng?',
      'time': '16:45',
      'type': 'text',
    },
  ];

  static const _quickReplies = [
    'Giao trÆ°á»›c cá»•ng nhÃ©',
    'TÃ´i ra ngay',
    'Gá»i khi tá»›i nÆ¡i',
    'Äang Ä‘á»£i báº¡n ðŸ˜Š',
    'á»”n rá»“i, cáº£m Æ¡n!',
  ];

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _sendMessage(String text) async {
    if (text.trim().isEmpty || _isSending) return;
    _messageController.clear();
    setState(() {
      _isSending = true;
      _localMessages.add({
        'id': DateTime.now().millisecondsSinceEpoch.toString(),
        'from': 'me',
        'text': text.trim(),
        'time': _currentTime(),
        'type': 'text',
      });
    });

    // Simulate API send
    await Future.delayed(const Duration(milliseconds: 300));
    if (mounted) setState(() => _isSending = false);

    // Scroll to bottom
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  String _currentTime() {
    final now = DateTime.now();
    return '${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final isShipper = widget.recipientType == 'shipper';

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new),
          onPressed: () => context.pop(),
        ),
        title: Row(
          children: [
            CircleAvatar(
              radius: 18,
              backgroundColor: AppColors.primary.withValues(alpha: 0.15),
              child: Icon(
                isShipper ? Iconsax.truck : Iconsax.shop,
                color: AppColors.primary,
                size: 18,
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.recipientName,
                    style: const TextStyle(
                      fontWeight: AppFontWeight.bold,
                      fontSize: AppFontSize.base,
                    ),
                  ),
                  Text(
                    isShipper ? 'ðŸš´ Shipper Ä‘ang giao hÃ ng' : 'ðŸ½ï¸ NhÃ  hÃ ng',
                    style: const TextStyle(
                      fontSize: AppFontSize.xs,
                      color: AppColors.textSecondaryLight,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Iconsax.call),
            tooltip: 'Gá»i Ä‘iá»‡n (áº©n sá»‘)',
            onPressed: () => _initiateCall(context),
          ),
        ],
      ),
      body: Column(
        children: [
          // â”€â”€â”€ Order info banner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          _OrderBanner(orderId: widget.orderId),

          // â”€â”€â”€ Message list â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              itemCount: _localMessages.length,
              itemBuilder: (ctx, i) => _MessageBubble(
                message: _localMessages[i],
                senderName: widget.recipientName,
              ),
            ),
          ),

          // â”€â”€â”€ Quick replies â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          SizedBox(
            height: 44,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              itemCount: _quickReplies.length,
              itemBuilder: (ctx, i) => GestureDetector(
                onTap: () => _sendMessage(_quickReplies[i]),
                child: Container(
                  margin: const EdgeInsets.only(right: 8, bottom: 6),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceAltLight,
                    borderRadius: const BorderRadius.all(AppRadius.full),
                    border: Border.all(color: AppColors.dividerLight),
                  ),
                  child: Text(
                    _quickReplies[i],
                    style: const TextStyle(
                      fontSize: AppFontSize.sm,
                      color: AppColors.textPrimaryLight,
                    ),
                  ),
                ),
              ),
            ),
          ),

          // â”€â”€â”€ Input bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          _InputBar(
            controller: _messageController,
            isSending: _isSending,
            onSend: _sendMessage,
          ),
        ],
      ),
    );
  }

  void _initiateCall(BuildContext context) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.all(AppRadius.lg),
        ),
        title: const Text('Gá»i Ä‘iá»‡n (áº¨n sá»‘)'),
        content: Text(
          'Báº¡n sáº½ Ä‘Æ°á»£c káº¿t ná»‘i vá»›i ${widget.recipientName} qua sá»‘ proxy táº¡m thá»i. Sá»‘ tháº­t cá»§a cáº£ hai bÃªn Ä‘Æ°á»£c báº£o máº­t.',
          style: const TextStyle(color: AppColors.textSecondaryLight),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Há»§y'),
          ),
          ElevatedButton.icon(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Äang káº¿t ná»‘i cuá»™c gá»i... ðŸ“ž')),
              );
            },
            icon: const Icon(Iconsax.call, size: 16),
            label: const Text('Gá»i ngay'),
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Order Info Banner
// ---------------------------------------------------------------------------

class _OrderBanner extends StatelessWidget {
  final String orderId;
  const _OrderBanner({required this.orderId});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      color: AppColors.primary.withValues(alpha: 0.06),
      child: Row(
        children: [
          const Icon(Iconsax.receipt_item, size: 16, color: AppColors.primary),
          const SizedBox(width: 8),
          Text(
            'ÄÆ¡n hÃ ng #$orderId Ä‘ang giao',
            style: const TextStyle(
              fontSize: AppFontSize.sm,
              color: AppColors.primary,
              fontWeight: AppFontWeight.semiBold,
            ),
          ),
          const Spacer(),
          const Text(
            'ðŸ”’ Sá»‘ tháº­t Ä‘Æ°á»£c áº©n',
            style: TextStyle(
              fontSize: AppFontSize.xs,
              color: AppColors.textSecondaryLight,
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Message Bubble
// ---------------------------------------------------------------------------

class _MessageBubble extends StatelessWidget {
  final Map<String, dynamic> message;
  final String senderName;

  const _MessageBubble({required this.message, required this.senderName});

  @override
  Widget build(BuildContext context) {
    final isMe = message['from'] == 'me';
    final text = message['text'] as String? ?? '';
    final time = message['time'] as String? ?? '';

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment:
            isMe ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (!isMe) ...[
            CircleAvatar(
              radius: 14,
              backgroundColor: AppColors.primary.withValues(alpha: 0.15),
              child: const Icon(Iconsax.truck, size: 14, color: AppColors.primary),
            ),
            const SizedBox(width: 8),
          ],
          Flexible(
            child: Column(
              crossAxisAlignment:
                  isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: isMe ? AppColors.primary : Colors.white,
                    borderRadius: BorderRadius.only(
                      topLeft: const Radius.circular(16),
                      topRight: const Radius.circular(16),
                      bottomLeft: Radius.circular(isMe ? 16 : 4),
                      bottomRight: Radius.circular(isMe ? 4 : 16),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.06),
                        blurRadius: 4,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Text(
                    text,
                    style: TextStyle(
                      color: isMe ? Colors.white : AppColors.textPrimaryLight,
                      fontSize: AppFontSize.base,
                    ),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  time,
                  style: const TextStyle(
                    fontSize: AppFontSize.xs,
                    color: AppColors.textSecondaryLight,
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

// ---------------------------------------------------------------------------
// Input Bar
// ---------------------------------------------------------------------------

class _InputBar extends StatelessWidget {
  final TextEditingController controller;
  final bool isSending;
  final void Function(String) onSend;

  const _InputBar({
    required this.controller,
    required this.isSending,
    required this.onSend,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(
        left: 12,
        right: 8,
        top: 10,
        bottom: MediaQuery.viewInsetsOf(context).bottom + 10,
      ),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 8,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Row(
        children: [
          IconButton(
            icon: const Icon(Iconsax.image, color: AppColors.textSecondaryLight),
            onPressed: () {},
          ),
          Expanded(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14),
              decoration: BoxDecoration(
                color: AppColors.surfaceAltLight,
                borderRadius: const BorderRadius.all(AppRadius.full),
              ),
              child: TextField(
                controller: controller,
                decoration: const InputDecoration(
                  hintText: 'Nháº­p tin nháº¯n...',
                  border: InputBorder.none,
                  hintStyle: TextStyle(color: AppColors.textSecondaryLight),
                ),
                textCapitalization: TextCapitalization.sentences,
                onSubmitted: onSend,
              ),
            ),
          ),
          const SizedBox(width: 6),
          GestureDetector(
            onTap: () => onSend(controller.text),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 44,
              height: 44,
              decoration: const BoxDecoration(
                color: AppColors.primary,
                shape: BoxShape.circle,
              ),
              child: isSending
                  ? const Center(
                      child: SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2,
                        ),
                      ),
                    )
                  : const Icon(Iconsax.send_1, color: Colors.white, size: 20),
            ),
          ),
        ],
      ),
    );
  }
}

