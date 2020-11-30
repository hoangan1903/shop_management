import React from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View, SafeAreaView, Text, ScrollView } from 'react-native';
import { Card, Button } from 'react-native-elements';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { paymentMethods, paymentStatus, orderStatus } from '../enums';
import { getDateTimeFromMilliseconds, getOrderQuantity } from '../helpers';

import CustomBadge from './CustomBadge';
import FormattedPrice from './FormattedPrice';

const OrderDetailsScreen = ({ route, allOrders }) => {
    const orderId = route.params.orderId;
    const order = allOrders.find(item => item.data.transactionNo === orderId);
    const orderData = order.data;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.container}>
                <Card>
                    <Card.Title style={styles.cardTitle}>Thông tin đơn hàng</Card.Title>
                    <Card.Divider />
                    <View style={styles.cardBody}>
                        <View style={styles.cardBodyLeft}>
                            <View style={styles.detailTextRow}>
                                <DetailIcon iconFamily="FontAwesome5" name="hashtag" />
                                <Text style={styles.detailText}>{orderId}</Text>
                            </View>
                            <View style={styles.detailTextRow}>
                                <DetailIcon iconFamily="Ionicons" name="time-outline" />
                                <Text style={styles.detailText}>{getDateTimeFromMilliseconds(orderData.createdAt)}</Text>
                            </View>
                            <View style={styles.detailTextRow}>
                                <DetailIcon iconFamily="FontAwesome" name="user-circle-o" />
                                <Text style={styles.detailText}>{orderData.userName}</Text>
                            </View>
                            <View style={styles.detailTextRow}>
                                <DetailIcon iconFamily="FontAwesome" name="phone" />
                                <Text style={styles.detailText}>{orderData.phoneNumber}</Text>
                            </View>
                            <View style={styles.detailTextRow}>
                                <DetailIcon iconFamily="FontAwesome5" name="hand-holding-usd" />
                                <Text style={styles.detailText}>Nhận hàng tại quầy</Text>
                            </View>
                        </View>
                        <View style={styles.cardBodyRight}>
                            <CustomBadge
                                text={orderStatus[orderData.status].title}
                                backgroundColor={orderStatus[orderData.status].indicatorColor}
                            />
                        </View>
                    </View>
                </Card>
                <Card>
                    <Card.Title style={styles.cardTitle}>
                        Chi tiết đơn hàng (Tổng: {getOrderQuantity(orderData.orderDetails)} món)
                    </Card.Title>
                    <Card.Divider />
                    <View style={styles.productTilesWrapper}>
                        {orderData.orderDetails.map((item, index) => <ProductTile key={index} product={item} />)}
                    </View>
                </Card>
                <Card>
                    <Card.Title style={styles.cardTitle}>Thanh toán</Card.Title>
                    <Card.Divider />
                    <View style={styles.cardBody}>
                        <View style={styles.cardBodyLeft}>
                            <View style={styles.detailTextRow}>
                                <Text style={{ fontSize: 15 }}>Khách trả:</Text>
                                <FormattedPrice value={orderData.totalAmount} style={styles.orderAmount} />
                            </View>
                            <View style={styles.detailTextRow}>
                                <Text style={{ fontSize: 15 }}>Thanh toán bằng:</Text>
                                <Text
                                    style={{
                                        ...styles.paymentMethod,
                                        color: paymentMethods[orderData.paymentMethod].indicatorColor
                                    }}
                                >
                                    {paymentMethods[orderData.paymentMethod].shortTitle}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.cardBodyRight}>
                            <CustomBadge
                                text={paymentStatus[orderData.paymentStatus].title}
                                backgroundColor={paymentStatus[orderData.paymentStatus].indicatorColor}
                            />
                        </View>
                    </View>
                </Card>
                <View style={styles.bottomActions}>
                    <Button title="Xác nhận" buttonStyle={{ backgroundColor: '#367ff5', width: 150, borderRadius: 5 }} />
                    <Button title="Huỷ đơn" buttonStyle={{ backgroundColor: '#db2828', width: 150, borderRadius: 5 }} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const DetailIcon = ({ iconFamily, name }) => {
    let iconJSX;

    if (iconFamily) {
        switch (iconFamily) {
            case 'Ionicons':
                iconJSX = (
                    <Ionicons
                        name={name}
                        size={iconOptions.size}
                        color={iconOptions.color}
                        style={{ width: iconOptions.width }}
                    />
                );
                break;
            case 'FontAwesome':
                iconJSX = (
                    <FontAwesome
                        name={name}
                        size={iconOptions.size}
                        color={iconOptions.color}
                        style={{ width: iconOptions.width }}
                    />
                );
                break;
            case 'FontAwesome5':
                iconJSX = (
                    <FontAwesome5
                        name={name}
                        size={iconOptions.size}
                        color={iconOptions.color}
                        style={{ width: iconOptions.width }}
                    />
                );
                break;
            default:
                iconJSX = null;
        }
    }

    return iconJSX;
};

const ProductTile = ({ product }) => {
    return (
        <View style={styles.productTile}>
            <View style={styles.productQtyContainer}>
                <View style={styles.productQtyWrapper}>
                    <Text style={styles.productQty}>
                        {product.quantity}
                    </Text>
                </View>
            </View>
            <View style={styles.productDetailsContainer}>
                <Text style={styles.productName}>
                    {product.productName}
                </Text>
                <View style={styles.productPricingContainer}>
                    <Text style={styles.pricing}>x </Text>
                    <FormattedPrice value={15000/* product.price */} style={styles.pricing} />
                    <Text style={styles.pricing}> = </Text>
                    <FormattedPrice value={product.quantity * 15000/* product.subtotal */} style={styles.pricingBold} />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f4f4'
    },
    cardTitle: {
        textAlign: 'left'
    },
    cardBody: {
        flexDirection: 'row'
    },
    cardBodyLeft: {
        flex: 2
    },
    cardBodyRight: {
        flex: 1,
        alignItems: 'flex-end'
    },
    detailTextRow: {
        paddingVertical: 3,
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailText: {
        fontSize: 15
    },
    orderAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4db856',
        marginStart: 4
    },
    paymentMethod: {
        fontSize: 15,
        fontWeight: 'bold',
        marginStart: 4
    },
    bottomActions: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        paddingVertical: 20,
        paddingHorizontal: 15
    },
    productTilesWrapper: {
        marginVertical: -6
    },
    productTile: {
        flexDirection: 'row',
        paddingVertical: 6
    },
    productQtyContainer: {
        flex: 1,
        justifyContent: 'center'
    },
    productQtyWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderColor: '#d3d3d3',
        borderStyle: 'solid',
        borderWidth: 1,
        borderRadius: 5,
        height: 50,
        width: 50
    },
    productQty: {
        color: '#4db856',
        fontSize: 20,
        fontWeight: 'bold'
    },
    productDetailsContainer: {
        flex: 4,
        justifyContent: 'center'
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold'
    },
    productPricingContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    pricing: {
        fontSize: 16,
        color: '#555'
    },
    pricingBold: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000'
    }
});

const iconOptions = {
    size: 20,
    color: '#333',
    width: 36
};

const mapStateToProps = ({ allOrders }) => ({ allOrders });
const ConnectedOrderDetailsScreen = connect(mapStateToProps)(OrderDetailsScreen);

export default ConnectedOrderDetailsScreen;
