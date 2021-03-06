import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View, SafeAreaView, Text, ScrollView, Alert, Modal } from 'react-native';
import { Card, Button } from 'react-native-elements';
import DropDownPicker from 'react-native-dropdown-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchOrder, updateOrder } from '../api';
import { PaymentMethod, PaymentStatus, OrderStatus, CancellationReason } from '../enums';
import { getDateTimeFromMilliseconds, getOrderQuantity } from '../helpers';
import { fetchNewOrders, refreshOngoingOrders, refreshCompletedOrders } from '../redux/actions';

import CustomBadge from './CustomBadge';
import FormattedPrice from './FormattedPrice';

const OrderDetailsScreen = ({ route, shouldOrderDetailsUpdate, fetchNewOrders, refreshOngoingOrders, refreshCompletedOrders }) => {
    const orderId = route.params.orderId;
    const [order, setOrder] = useState(null);
    const [refreshing, setRefreshing] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [cancellationReason, setCancellationReason] = useState('');

    useEffect(() => {
        if (refreshing) {
            fetchOrder(orderId)
                .then(response => setOrder(response.data))
                .catch(error => console.error(error))
                .finally(() => setRefreshing(false));
        }
    }, [refreshing]);

    useEffect(() => {
        if (
            shouldOrderDetailsUpdate
            && shouldOrderDetailsUpdate === orderId
            && order && order.status !== OrderStatus.CANCELED.value
        ) {
            fetchOrder(orderId)
                .then(response => setOrder(response.data))
                .catch(error => console.error(error));
        }
    }, [shouldOrderDetailsUpdate]);

    if (order) {
        return (
            <SafeAreaView style={styles.container}>
                <ScrollView>
                    <View style={styles.innerContainer}>
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
                                        <Text style={styles.detailText}>{getDateTimeFromMilliseconds(order.createdAt)}</Text>
                                    </View>
                                    <View style={styles.detailTextRow}>
                                        <DetailIcon iconFamily="FontAwesome" name="user-circle-o" />
                                        <Text style={styles.detailText}>{order.userName}</Text>
                                    </View>
                                    <View style={styles.detailTextRow}>
                                        <DetailIcon iconFamily="FontAwesome" name="phone" />
                                        <Text style={styles.detailText}>{order.phoneNumber}</Text>
                                    </View>
                                    <View style={styles.detailTextRow}>
                                        <DetailIcon iconFamily="MaterialCommunityIcons" name="note-text-outline" />
                                        <Text style={styles.detailText}>{order.note || '<Không có>'}</Text>
                                    </View>
                                    <View style={styles.detailTextRow}>
                                        <DetailIcon iconFamily="FontAwesome5" name="hand-holding-usd" />
                                        <Text style={styles.detailText}>Nhận hàng tại quầy</Text>
                                    </View>
                                    {
                                        order.status === OrderStatus.CANCELED.value && order.cancelReason
                                            ? <View style={{ ...styles.detailTextRow, marginTop: 5 }}>
                                                <Text style={styles.cancellationReason}>Lý do huỷ đơn: {order.cancelReason}</Text>
                                            </View>
                                            : null
                                    }
                                </View>
                                <View style={styles.cardBodyRight}>
                                    <CustomBadge
                                        text={OrderStatus[order.status].title}
                                        backgroundColor={OrderStatus[order.status].indicatorColor}
                                    />
                                </View>
                            </View>
                        </Card>
                        <Card>
                            <Card.Title style={styles.cardTitle}>
                                Chi tiết đơn hàng (Tổng: {getOrderQuantity(order.orderDetails)} món)
                    </Card.Title>
                            <Card.Divider />
                            <View style={styles.productTilesWrapper}>
                                {order.orderDetails.map((item, index) => <ProductTile key={index} product={item} />)}
                            </View>
                        </Card>
                        <Card>
                            <Card.Title style={styles.cardTitle}>Thanh toán</Card.Title>
                            <Card.Divider />
                            <View style={styles.cardBody}>
                                <View style={styles.cardBodyLeft}>
                                    <View style={styles.detailTextRow}>
                                        <Text style={{ fontSize: 15 }}>Khách trả:</Text>
                                        <FormattedPrice value={order.totalAmount} style={styles.orderAmount} />
                                    </View>
                                    <View style={styles.detailTextRow}>
                                        <Text style={{ fontSize: 15 }}>Thanh toán bằng:</Text>
                                        <Text
                                            style={{
                                                ...styles.paymentMethod,
                                                color: PaymentMethod[order.paymentMethod].indicatorColor
                                            }}
                                        >
                                            {PaymentMethod[order.paymentMethod].shortTitle}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.cardBodyRight}>
                                    {
                                        PaymentStatus[order.paymentStatus]
                                            ? <CustomBadge
                                                text={PaymentStatus[order.paymentStatus].title}
                                                backgroundColor={PaymentStatus[order.paymentStatus].indicatorColor}
                                            />
                                            : null
                                    }
                                </View>
                            </View>
                        </Card>
                        <View
                            style={order.status === OrderStatus.NEW.value || order.status === OrderStatus.RECEIVED.value
                                ? styles.bottomActions
                                : styles.hidden
                            }
                        >
                            <Button
                                title="Xác nhận"
                                buttonStyle={{ backgroundColor: '#367ff5', width: 150, borderRadius: 5 }}
                                onPress={() => {
                                    Alert.alert(
                                        'Xác nhận đơn hàng',
                                        'Bạn muốn xác nhận thực hiện đơn hàng này?\nLưu ý: Không thể huỷ đơn hàng sau khi đã xác nhận.',
                                        [{
                                            text: 'Không',
                                            style: 'cancel'
                                        },
                                        {
                                            text: 'Có',
                                            onPress: () => {
                                                updateOrder({
                                                    transactionNo: order.transactionNo,
                                                    status: OrderStatus.CONFIRMED.value,
                                                    cancelReason: ''
                                                })
                                                    .then(() => {
                                                        fetchNewOrders();
                                                        refreshOngoingOrders();
                                                        setRefreshing(true);
                                                    })
                                                    .catch(error => console.error(error));
                                            }
                                        }],
                                        { cancelable: false }
                                    );
                                }}
                            />
                            <Button
                                title="Huỷ đơn"
                                buttonStyle={{ backgroundColor: '#db2828', width: 150, borderRadius: 5 }}
                                onPress={() => setModalVisible(true)}
                            />
                        </View>
                        <View
                            style={order.status === OrderStatus.CONFIRMED.value
                                ? styles.bottomSingleAction
                                : styles.hidden
                            }
                        >
                            <Button
                                title="Sẵn sàng giao!"
                                buttonStyle={{ backgroundColor: '#367ff5', width: 180, borderRadius: 5 }}
                                onPress={() => {
                                    updateOrder({
                                        transactionNo: order.transactionNo,
                                        status: OrderStatus.AVAILABLE.value,
                                        cancelReason: ''
                                    })
                                        .then(() => {
                                            refreshOngoingOrders();
                                            setRefreshing(true);
                                        })
                                        .catch(error => console.error(error));
                                }}
                            />
                        </View>
                        <View
                            style={order.status === OrderStatus.AVAILABLE.value
                                ? styles.bottomSingleAction
                                : styles.hidden
                            }
                        >
                            <Button
                                title="Hoàn thành đơn"
                                buttonStyle={{ backgroundColor: '#367ff5', width: 180, borderRadius: 5 }}
                                onPress={() => {
                                    updateOrder({
                                        transactionNo: order.transactionNo,
                                        status: OrderStatus.COMPLETED.value,
                                        cancelReason: ''
                                    })
                                        .then(() => {
                                            refreshOngoingOrders();
                                            refreshCompletedOrders();
                                            setRefreshing(true);
                                        })
                                        .catch(error => console.error(error));
                                }}
                            />
                        </View>
                    </View>
                    <View style={styles.centeredView}>
                        <Modal
                            animationType="fade"
                            transparent={true}
                            visible={modalVisible}
                        >
                            <View style={styles.centeredView}>
                                <View style={styles.modalView}>
                                    <View style={{}}>
                                        <Text style={styles.modalTitle}>Huỷ đơn hàng</Text>
                                        <Text style={styles.modalText}>Vui lòng cho biết lý do huỷ đơn hàng:</Text>
                                        <DropDownPicker
                                            items={[
                                                {
                                                    label: CancellationReason.OUT_OF_STOCK.label,
                                                    value: CancellationReason.OUT_OF_STOCK.value
                                                },
                                                {
                                                    label: CancellationReason.STORE_CLOSED.label,
                                                    value: CancellationReason.STORE_CLOSED.value
                                                }
                                            ]}
                                            placeholder="Chọn một lý do..."
                                            defaultValue={cancellationReason}
                                            containerStyle={{ height: 42, marginTop: 12 }}
                                            style={{ backgroundColor: '#fafafa' }}
                                            dropDownStyle={{ backgroundColor: '#fafafa' }}
                                            itemStyle={{ justifyContent: 'flex-start' }}
                                            onChangeItem={({ value }) => setCancellationReason(value)}
                                        />
                                    </View>
                                    <View style={styles.modalBottomActions}>
                                        <Button
                                            title="Suy nghĩ lại"
                                            buttonStyle={{
                                                backgroundColor: '#888',
                                                width: 120,
                                                borderRadius: 5,
                                                marginEnd: 6
                                            }}
                                            onPress={() => {
                                                setModalVisible(false);
                                                setCancellationReason('');
                                            }}
                                        />
                                        <Button
                                            disabled={!cancellationReason}
                                            title="Huỷ đơn"
                                            buttonStyle={{
                                                backgroundColor: '#db2828',
                                                width: 120,
                                                borderRadius: 5,
                                                marginStart: 6
                                            }}
                                            onPress={() => {
                                                if (cancellationReason) {
                                                    setModalVisible(false);
                                                    updateOrder({
                                                        transactionNo: order.transactionNo,
                                                        status: OrderStatus.CANCELED.value,
                                                        cancelReason: cancellationReason
                                                    })
                                                        .then(() => {
                                                            fetchNewOrders();
                                                            refreshCompletedOrders();
                                                            setRefreshing(true);
                                                        })
                                                        .catch(error => console.error(error));
                                                } else {
                                                    Alert.alert(
                                                        'Chưa chọn lý do huỷ đơn',
                                                        'Vui lòng chọn một lý do để huỷ đơn.',
                                                        [{ text: 'OK' }],
                                                        { cancelable: false }
                                                    );
                                                }
                                            }}
                                        />
                                    </View>
                                </View>
                            </View>
                        </Modal>
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    return null;
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
            case 'MaterialCommunityIcons':
                iconJSX = (
                    <MaterialCommunityIcons
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
                    <FormattedPrice value={product.price} style={styles.pricing} />
                    <Text style={styles.pricing}> = </Text>
                    <FormattedPrice value={product.subtotal} style={styles.pricingBold} />
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
    innerContainer: {
        flex: 1,
        paddingBottom: 15
    },
    hidden: {
        display: 'none'
    },
    cardTitle: {
        textAlign: 'left'
    },
    cardBody: {
        flexDirection: 'row'
    },
    cardBodyLeft: {
        flex: 1
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
    cancellationReason: {
        fontSize: 15,
        color: '#db2828'
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
        paddingTop: 20,
        paddingHorizontal: 15
    },
    bottomSingleAction: {
        alignItems: 'center',
        paddingTop: 20,
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
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalView: {
        margin: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 30
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12
    },
    modalText: {
        fontSize: 16,
        color: '#222'
    },
    modalBottomActions: {
        flexDirection: 'row',
        marginTop: 24
    }
});

const iconOptions = {
    size: 20,
    color: '#333',
    width: 36
};

const mapStateToProps = ({ shouldOrderDetailsUpdate }) => ({ shouldOrderDetailsUpdate });

const mapDispatchToProps = {
    fetchNewOrders,
    refreshOngoingOrders,
    refreshCompletedOrders
};

const ConnectedOrderDetailsScreen = connect(mapStateToProps, mapDispatchToProps)(OrderDetailsScreen);

export default ConnectedOrderDetailsScreen;
