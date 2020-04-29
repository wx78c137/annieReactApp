import React, { Component } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, FlatList , AsyncStorage, BackHandler, Alert, Vibration, ToastAndroid} from 'react-native';
import {createBottomTabNavigator} from 'react-navigation';
export class OrderList extends Component {
  //Khai báo biến
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      token: '',
      isLoading: true,
      clickcount:0,
    };
    //AsyncStorage.removeItem('userToken')
    this.getToken();
  }
// check back button state
  _resetCount = () => {
    this.setState({clickcount:0});
    BackHandler.exitApp();
  }
  check=()=>{
    this.state.clickcount<2 ? ToastAndroid.show('Nhấn Back lần nữa để thoát', ToastAndroid.SHORT)  :this._resetCount()
      }
//--------------------------
  backAction = () => {
    this.setState({'clickcount':this.state.clickcount+1});
    setTimeout(() => {
                this.state.clickcount = 0
            }, 2000);
    this.check();
    return true
  };
//After click order
  onClickListener = (item) => {
    Vibration.vibrate(70);
    this.props.navigation.navigate('Detail', { 'itemID': item.id, 'token': this.state.token });
  }
//-----------------
//logo click
logoListener = () => {
  Vibration.vibrate(150);
  this.getToken();
}
//----------
//Navigation headers
  static navigationOptions = {
      title: null,
      headerLeft: () => null,
      headerShown: false,
  };
//------------------

  async getToken() {
    try {
      let userToken = await AsyncStorage.getItem("userToken");
      let token = JSON.parse(userToken);
      this.makeRequest(token);
      this.setState({token: token});
    } catch (error) {
      console.log("Something went wrong", error);
    }
  }

  makeRequest = (token) =>{
    fetch('https://anniecosmetic.vn/api/orders', { method: 'GET' , headers: {'Authorization': 'Token ' + token}})
      .then((response) => response.json())
      .then((json) => {
      !!json.results ? this.setState({ data: json.results }) : this.props.navigation.push('Login');
      })
      .catch((error) => console.error(error))
      .finally(() => {
        this.setState({ isLoading: false });
      });
  }

  componentDidMount() {
    this.backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      this.backAction
    );
  }

  componentWillUnmount() {
    //AsyncStorage.removeItem('userToken')
    this.backHandler.remove();
  }
  render() {
    return (

      <View style= { styles.container }>
        <View style= {styles.brand}>
        <TouchableOpacity onPress={() => this.logoListener()}>
          <Text style={styles.brand_text}>ANNIECOSMETIC</Text>
        </TouchableOpacity>
        </View>
        <View style={styles.header}>
          <Text style={styles.headerText}>DANH SÁCH ĐƠN HÀNG</Text>
        </View>
        <FlatList
            data={ this.state.data }
            keyExtractor = {(item, index) => index.toString()}
            renderItem = {({ item }) =>
              <TouchableOpacity activeOpacity={ 0.8 } onPress = {() => this.onClickListener(item)}>
                <View style={ styles.order_wrap}>
                  <View style={{ flexDirection: 'row', marginLeft: 20, marginRight: 20, paddingTop: 5,}}>
                    <View style={styles.code}>
                      <Text style={{color:'#f48b8c', fontWeight:'bold' }}>MÃ ĐƠN HÀNG: </Text>
                      <Text>{item.order_code}</Text>
                    </View>
                    <View style={styles.cost}>
                      <Text> { item.total_cost } < /Text>
                    </View>
                  </View>
                  <View style = {{ flexDirection: 'row', marginLeft: 20,}}>
                    <Text style={styles.customer}>{ item.name } < /Text>
                    <View style={styles.status}>
                      <Text style = {item.confirm && item.paid ? styles.paid : item.confirm && !item.paid ? styles.confirm : styles.not_confirm}>
                       { item.confirm && item.paid ? 'Đã hoàn thành': item.confirm && !item.paid ? 'Đã xác nhận' : 'Chưa xác nhận' }
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
          }
        />
      </View>
  );}
}

const styles = StyleSheet.create({
  container: {flex: 1,marginTop:40},
  brand:{alignItems:'center', marginBottom:10},
  brand_text:{color: '#f48b8c', fontSize: 30, fontWeight: 'bold'},
  header : {backgroundColor: '#f48b8c', height:40, justifyContent:'center'},
  headerText :{color: '#fff', textAlign: 'center', fontWeight: 'bold',fontSize: 15},
  order_wrap: {marginBottom: 10,borderBottomWidth:1,borderBottomColor:'#bbb',height: 60,},
  customer:{textTransform: 'uppercase',color:'#bbb',fontWeight:'bold'},
  status: {width: 120, alignItems: 'center', marginLeft: 'auto'},
  confirm:{textTransform: 'uppercase',color:'#f48b8c', fontWeight:'bold'},
  paid :{textTransform: 'uppercase',color:'#fff', backgroundColor: '#bbb'},
  not_confirm:{textTransform: 'uppercase',color: '#fff', backgroundColor: '#f48b8c', width:120, textAlign:'center', fontWeight:'bold', marginRight: '5%'},
  code:{flexDirection: 'row', height: 25, justifyContent:'center'},
  cost:{marginLeft:'auto'},
});
export default OrderList
