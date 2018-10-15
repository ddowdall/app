import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
} from 'react-native';
import {Icon} from 'expo';
import {connect} from 'react-redux';
import Colors from '../constants/Colors';

let audioPlayer = new Expo.Audio.Sound();
const trackPrefix = 'https://a.musicoin.org/tracks/';
const trackSuffix = '/index.m3u8';

class HomeScreen extends React.Component {
  static navigationOptions = {
    headerTitle: <View style={{flex: 1, alignItems: 'center', backgroundColor: Colors.backgroundColor, margin: 0, padding: 0}}>
      <Image resizeMode={'center'} style={{width: 150, height: 35.625, margin: 0, padding: 0}} source={require('../assets/images/logo.png')}/>
    </View>,
    headerStyle:
        {
          backgroundColor: Colors.backgroundColor,
          borderBottomWidth: 0,
        },
  };

  constructor(props) {
    super(props);
    this.state = {currentTrack: null, isPlaying: false};
  }

  render() {
    return (
        <View style={styles.container}>
          <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} refreshing={this.props.releases == []}>
            <FlatList
                data={this.props.releases}
                keyExtractor={this._keyExtractor}
                renderItem={this._renderItem}
            />
          </ScrollView>
          {this.state.currentTrack ? <View style={styles.playerContainer}>
            <View style={styles.albumArtPlayerContainer}>
              <Image style={{width: 70, height: 70}} source={require('../assets/images/albumart.png')}/>
            </View>

            <View style={styles.songInfo}>
              <Text style={{color: Colors.fontColor}}>This is a good song</Text>
              <Text style={{color: Colors.fontColor, fontSize: 10}}>{this.state.currentTrack.artistName}</Text>
            </View>

            {this.state.isPlaying ? <TouchableOpacity>
                  <Icon.Ionicons onPress={() => this.pauseTrack()}
                                 name={Platform.OS === 'ios' ? `ios-pause` : 'md-pause'}
                                 size={26}
                                 color={Colors.tabIconSelected}
                                 style={styles.playerButton}
                  />
                </TouchableOpacity> :
                <TouchableOpacity onPress={() => this.resumeTrack()}>
                  <Icon.Ionicons
                      name={Platform.OS === 'ios' ? `ios-play` : 'md-play'}
                      size={26}
                      color={Colors.tabIconSelected}
                      style={styles.playerButton}
                  />
                </TouchableOpacity>}
          </View> : null}
        </View>
    );
  }

  _keyExtractor = (item, index) => item.trackURL;

  _renderItem = ({item}) => (
      <View style={styles.trackContainer}>
        <View style={styles.albumArtContainer}>
          <Image style={{width: 30, height: 30}} source={require('../assets/images/albumart.png')}/>
        </View>

        <TouchableOpacity style={styles.releaseTrackContainer} onPress={() => this.props.navigation.navigate('ReleaseDetail', {track: item})}>
          <Text style={{color: Colors.fontColor}}>This is a good song</Text>
          <Text style={{color: Colors.fontColor, fontSize: 10}}>{item.artistName}</Text>
        </TouchableOpacity>

        <View style={styles.individualPlayerButton}>
          <TouchableOpacity onPress={() => this.loadAndPlayTrack(item)}>
            <Icon.Ionicons
                name={Platform.OS === 'ios' ? `ios-play` : 'md-play'}
                size={18}
                color={Colors.tabIconSelected}
                style={styles.playerButton}
            />
          </TouchableOpacity>
        </View>
      </View>
  );

  async loadAndPlayTrack(track) {

    this.setState({currentTrack: track, isPlaying: true});

    //get track url, last part of trackURL is the ID
    let trackPartArray = track.trackURL.split('/');
    let trackId = trackPartArray[trackPartArray.length - 1];

    let playbackState = await audioPlayer.getStatusAsync();
    console.log(playbackState);

    if (playbackState.isLoaded) {
      await audioPlayer.stopAsync();
      await audioPlayer.unloadAsync();
    }

    await audioPlayer.loadAsync({uri: trackPrefix + trackId + trackSuffix}, {}, false);
    await audioPlayer.playAsync();

  };

  async pauseTrack() {
    this.setState({isPlaying: false});
    await audioPlayer.pauseAsync();
  }

  async resumeTrack() {
    this.setState({isPlaying: true});
    await audioPlayer.playAsync();
  }
}

function mapStateToProps(state) {
  return state;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundColor,
  },
  contentContainer: {
    paddingTop: 0,
  },
  trackContainer: {
    flexDirection: 'row',
  },
  releaseTrackContainer: {
    padding: 10,
    flex: 0.9,
  },
  playButtonContainer: {
    padding: 0,
    margin: 0,
    flex: 0.1,
  },
  playerContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: {height: -3},
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: Colors.backgroundColor,
    paddingVertical: 5,
  },
  playerButton: {
    padding: 10,
    marginLeft: 10,
    flex: 0.1,
  },
  individualPlayerButton: {
    marginRight: 10,
    paddingTop: 5,
    flex: 0.2,
  },
  albumArtContainer: {
    padding: 10,
    flex: 0.1,
  },
  albumArtPlayerContainer: {
    padding: 10,
    flex: 0.3,
  },
  songInfo: {
    padding: 10,
    marginRight: 10,
    flex: 0.6,
  },
});

export default connect(mapStateToProps, null)(HomeScreen);
