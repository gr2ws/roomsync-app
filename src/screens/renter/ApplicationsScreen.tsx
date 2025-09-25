import { View, Text, FlatList, TouchableOpacity, Image, Modal, Pressable } from 'react-native';
import { useState } from 'react';

export default function ApplicationsScreen() {
  // Define Application type
  type Application = {
    id: string;
    property: string;
    address: string;
    image: any;
    status: 'Pending' | 'Approved' | 'Rejected';
    date: string;
    message: string;
  };

  // Mock data for applications
  const [selected, setSelected] = useState<Application | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const applications: Application[] = [
    {
      id: '1',
      property: 'Sunny Apartment',
      address: '123 Main St',
      image: require('../../assets/room1.jpg'),
      status: 'Pending',
      date: '2025-09-20',
      message: 'Your application is under review.',
    },
    {
      id: '2',
      property: 'Cozy Loft',
      address: '456 Oak Ave',
      image: require('../../assets/room2.jpg'),
      status: 'Approved',
      date: '2025-09-15',
      message: 'Congratulations! You have been approved.',
    },
    {
      id: '3',
      property: 'Modern Studio',
      address: '789 Pine Rd',
      image: require('../../assets/room3.jpg'),
      status: 'Rejected',
      date: '2025-09-10',
      message: 'Sorry, your application was not successful.',
    },
  ];

  const statusColors: Record<Application['status'], string> = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Approved: 'bg-green-100 text-green-800',
    Rejected: 'bg-red-100 text-red-800',
  };

  const renderItem = ({ item }: { item: Application }) => (
    <TouchableOpacity
      className="mb-4 flex-row items-center overflow-hidden rounded-xl border border-gray-100 bg-white p-0.5 shadow-md"
      onPress={() => {
        setSelected(item);
        setModalVisible(true);
      }}
      activeOpacity={0.85}>
      <Image source={item.image} className="m-2 h-24 w-24 rounded-xl" resizeMode="cover" />
      <View className="flex-1 pr-2">
        <Text className="mb-0.5 text-base font-bold text-gray-900">{item.property}</Text>
        <Text className="mb-1 text-xs text-gray-600">{item.address}</Text>
        <View className="mb-1 flex-row items-center">
          <View className={`rounded-full px-2 py-0.5 ${statusColors[item.status]}`}>
            <Text className="text-xs font-semibold">{item.status}</Text>
          </View>
          <Text className="ml-2 text-xs text-gray-400">{item.date}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white px-4 pt-4">
      <View className="mb-4">
        <Text className="text-3xl font-bold text-gray-900">My Applications</Text>
        <Text className="text-gray-600">Track your property applications and their status.</Text>
      </View>

      {applications.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Image source={require('../../assets/room5.jpg')} className="mb-4 h-32 w-32 opacity-60" />
          <Text className="text-base text-gray-500">No applications yet.</Text>
        </View>
      ) : (
        <FlatList
          data={applications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 32, paddingTop: 4, paddingHorizontal: 2 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Application Details Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}>
        <View className="flex-1 items-center justify-center bg-black/40">
          <View className="h-[37%] w-[95%] overflow-hidden rounded-xl bg-white shadow-lg">
            {selected && (
              <>
                <View>
                  <Image source={selected.image} className="h-40 w-full" resizeMode="cover" />
                  <Pressable
                    onPress={() => setModalVisible(false)}
                    className="absolute left-2 top-2 rounded-full bg-white/80 p-1">
                    {/* Use Ionicons or similar for close icon if available */}
                    <Text className="text-lg font-bold text-gray-700">×</Text>
                  </Pressable>
                </View>
                <View className="flex-1 gap-2 px-4 pb-6 pt-3">
                  <Text className="mb-0.5 text-xl font-bold text-gray-900">
                    {selected.property}
                  </Text>
                  <Text className="mb-1 text-xs text-gray-600">{selected.address}</Text>
                  <View className="mb-1 flex-row items-center">
                    <View className={`rounded-full px-2 py-0.5 ${statusColors[selected.status]}`}>
                      <Text className="text-xs font-semibold">{selected.status}</Text>
                    </View>
                    <Text className="ml-2 text-xs text-gray-400">{selected.date}</Text>
                  </View>
                  <Text className="mb-2 text-xs text-gray-700">Applied on: {selected.date}</Text>
                  <Text className="mb-4 text-sm text-gray-600">{selected.message}</Text>
                  <Pressable
                    className="mb-2 w-full items-center rounded-lg bg-blue-500 py-3"
                    onPress={() => setModalVisible(false)}>
                    <Text className="font-bold text-white">Close</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
