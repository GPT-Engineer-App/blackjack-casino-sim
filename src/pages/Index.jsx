import React, { useState } from "react";
import { Box, Button, Flex, Heading, Text, VStack, HStack, useToast } from "@chakra-ui/react";
import { FaDollarSign } from "react-icons/fa";

const suits = ["♦", "♣", "♥", "♠"];
const ranks = [
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4", value: 4 },
  { label: "5", value: 5 },
  { label: "6", value: 6 },
  { label: "7", value: 7 },
  { label: "8", value: 8 },
  { label: "9", value: 9 },
  { label: "10", value: 10 },
  { label: "J", value: 10 },
  { label: "Q", value: 10 },
  { label: "K", value: 10 },
  { label: "A", value: 11 },
];

const getShuffledDeck = () => {
  const deck = [];
  suits.forEach((suit) => {
    ranks.forEach(({ label, value }) => {
      deck.push({ suit, label, value });
    });
  });

  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
};

const calculateScore = (hand) => {
  let score = 0;
  let aces = 0;

  hand.forEach((card) => {
    score += card.value;
    if (card.label === "A") {
      aces += 1;
    }
  });

  while (score > 21 && aces > 0) {
    score -= 10;
    aces -= 1;
  }

  return score;
};

const Index = () => {
  const [deck, setDeck] = useState(getShuffledDeck());
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const toast = useToast();

  const dealInitialCards = () => {
    const initialPlayerHand = [deck.pop(), deck.pop()];
    const initialDealerHand = [deck.pop(), { ...deck.pop(), isHidden: true }];

    setPlayerHand(initialPlayerHand);
    setDealerHand(initialDealerHand);
    setDeck(deck);
    setIsGameOver(false);
  };

  const handleHit = () => {
    const newCard = deck.pop();
    const newHand = [...playerHand, newCard];

    setPlayerHand(newHand);
    setDeck(deck);

    if (calculateScore(newHand) > 21) {
      setIsGameOver(true);
      toast({
        title: "Bust!",
        description: "You went over 21!",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleStand = () => {
    let newDealerHand = [...dealerHand];
    newDealerHand[1].isHidden = false; // Reveal hidden card

    while (calculateScore(newDealerHand) < 17) {
      newDealerHand.push(deck.pop());
    }

    setDealerHand(newDealerHand);
    setIsGameOver(true);

    const playerScore = calculateScore(playerHand);
    const dealerScore = calculateScore(newDealerHand);
    let title, description;

    if (dealerScore > 21 || playerScore > dealerScore) {
      title = "You win!";
      description = "Congratulations, you beat the dealer!";
    } else if (dealerScore === playerScore) {
      title = "Push!";
      description = "It's a tie!";
    } else {
      title = "You lose!";
      description = "The dealer has won!";
    }

    toast({
      title,
      description,
      status: dealerScore > 21 || playerScore > dealerScore ? "success" : "error",
      duration: 3000,
      isClosable: true,
    });
  };

  const renderCard = (card) => (
    <Box w="60px" h="90px" borderWidth="1px" borderRadius="md" display="flex" alignItems="center" justifyContent="center" fontSize="xl" m="2" bg="white">
      {card.isHidden ? "?" : `${card.label}${card.suit}`}
    </Box>
  );

  const startNewGame = () => {
    setDeck(getShuffledDeck());
    setPlayerHand([]);
    setDealerHand([]);
    dealInitialCards();
  };

  return (
    <VStack spacing="8" my="5%">
      <Heading>Blackjack</Heading>
      <HStack>
        <Button leftIcon={<FaDollarSign />} colorScheme="green" onClick={startNewGame}>
          New Game
        </Button>
      </HStack>
      <Flex justify="space-around" w="100%">
        <VStack>
          <Text>Dealer's Hand</Text>
          <HStack>{dealerHand.map((card) => renderCard(card))}</HStack>
        </VStack>
        <VStack>
          <Text>Player's Hand ({calculateScore(playerHand)})</Text>
          <HStack>{playerHand.map((card) => renderCard(card))}</HStack>
          {!isGameOver && (
            <HStack>
              <Button colorScheme="blue" onClick={handleHit}>
                Hit
              </Button>
              <Button colorScheme="purple" onClick={handleStand}>
                Stand
              </Button>
            </HStack>
          )}
        </VStack>
      </Flex>
    </VStack>
  );
};

export default Index;
