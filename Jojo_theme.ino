void setup() {
  // put your setup code here, to run once:
  pinMode(2,OUTPUT);
  pinMode(3,OUTPUT);
  pinMode(4,OUTPUT);
  pinMode(5,OUTPUT);
  pinMode(6,OUTPUT);
  pinMode(7,OUTPUT);

}


 

void loop() {
  digitalWrite(2, HIGH); digitalWrite(3, HIGH); digitalWrite(4, HIGH);
  delay(200);
  digitalWrite(2, LOW);  digitalWrite(3, LOW);  digitalWrite(4, LOW);
  delay(50);
  digitalWrite(5, HIGH); digitalWrite(6, HIGH); digitalWrite(7, HIGH);
  delay(100);
  digitalWrite(5, LOW);  digitalWrite(6, LOW);  digitalWrite(7, LOW);
  delay(20);
  digitalWrite(2, HIGH); digitalWrite(3, HIGH); digitalWrite(4, HIGH);
  delay(100);
  digitalWrite(2, LOW);  digitalWrite(3, LOW);  digitalWrite(4, LOW);
  delay(50);
  digitalWrite(5, HIGH); digitalWrite(6, HIGH); digitalWrite(7, HIGH);
  delay(100);
  digitalWrite(5, LOW);  digitalWrite(6, LOW);  digitalWrite(7, LOW);
  delay(20);
  digitalWrite(2, HIGH); digitalWrite(3, HIGH); digitalWrite(4, HIGH);
  delay(100);
  digitalWrite(2, LOW);  digitalWrite(3, LOW);  digitalWrite(4, LOW);
  delay(50);
  digitalWrite(5, HIGH); digitalWrite(6, HIGH); digitalWrite(7, HIGH);
  delay(400); 
  digitalWrite(5, LOW);  digitalWrite(6, LOW);  digitalWrite(7, LOW);
  delay(800);
}



