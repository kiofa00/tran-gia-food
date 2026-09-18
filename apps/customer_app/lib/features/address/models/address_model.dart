class AddressItem {
  final String id;
  final String title;
  final String? recipientName;
  final String? phone;
  final String street;
  final String ward;
  final String district;
  final String city;
  final String fullAddress;
  final double lat;
  final double lng;
  final bool isDefault;
  final String? deliveryNote;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const AddressItem({
    required this.id,
    required this.title,
    this.recipientName,
    this.phone,
    required this.street,
    required this.ward,
    required this.district,
    required this.city,
    required this.fullAddress,
    required this.lat,
    required this.lng,
    this.isDefault = false,
    this.deliveryNote,
    this.createdAt,
    this.updatedAt,
  });

  factory AddressItem.fromJson(Map<String, dynamic> json) {
    return AddressItem(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? 'Địa chỉ',
      recipientName: json['recipientName'] as String?,
      phone: json['phone'] as String?,
      street: json['street'] as String? ?? '',
      ward: json['ward'] as String? ?? '',
      district: json['district'] as String? ?? '',
      city: json['city'] as String? ?? '',
      fullAddress: json['fullAddress'] as String? ?? '',
      lat: (json['lat'] as num?)?.toDouble() ?? 0.0,
      lng: (json['lng'] as num?)?.toDouble() ?? 0.0,
      isDefault: json['isDefault'] as bool? ?? false,
      deliveryNote: json['deliveryNote'] as String?,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'] as String)
          : null,
      updatedAt: json['updatedAt'] != null
          ? DateTime.tryParse(json['updatedAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      if (recipientName != null) 'recipientName': recipientName,
      if (phone != null) 'phone': phone,
      'street': street,
      'ward': ward,
      'district': district,
      'city': city,
      'fullAddress': fullAddress,
      'lat': lat,
      'lng': lng,
      'isDefault': isDefault,
      if (deliveryNote != null) 'deliveryNote': deliveryNote,
      if (createdAt != null) 'createdAt': createdAt!.toIso8601String(),
      if (updatedAt != null) 'updatedAt': updatedAt!.toIso8601String(),
    };
  }

  AddressItem copyWith({
    String? id,
    String? title,
    String? recipientName,
    String? phone,
    String? street,
    String? ward,
    String? district,
    String? city,
    String? fullAddress,
    double? lat,
    double? lng,
    bool? isDefault,
    String? deliveryNote,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return AddressItem(
      id: id ?? this.id,
      title: title ?? this.title,
      recipientName: recipientName ?? this.recipientName,
      phone: phone ?? this.phone,
      street: street ?? this.street,
      ward: ward ?? this.ward,
      district: district ?? this.district,
      city: city ?? this.city,
      fullAddress: fullAddress ?? this.fullAddress,
      lat: lat ?? this.lat,
      lng: lng ?? this.lng,
      isDefault: isDefault ?? this.isDefault,
      deliveryNote: deliveryNote ?? this.deliveryNote,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
