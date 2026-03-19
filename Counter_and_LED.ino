int counter; // in the "brain" of the arduino -1 +2(from counter+=2)|| then it starts at the result i.e -1 + 2= 1

void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  pinMode(LED_BUILTIN,OUTPUT);
}

void loop() {
  // put your main code here, to run repeatedly:
  digitalWrite(LED_BUILTIN,HIGH);
  Serial.print("Counter:");
  Serial.println(counter);
  delay(1000);

  digitalWrite(LED_BUILTIN,LOW);
  Serial.print("Counter:");
  Serial.println(counter);
  delay(1000);

  counter+=1;

  
}
